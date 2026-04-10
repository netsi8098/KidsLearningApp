/**
 * NavIcons — Custom SVG icons for the bottom navigation bar.
 * Each icon is a cute, flat cartoon style with chunky strokes.
 */

interface IconProps {
  size?: number;
  color?: string;
  active?: boolean;
  className?: string;
}

function iconColor(active: boolean | undefined, color: string | undefined) {
  return active ? (color ?? '#FF6B6B') : '#9B9BAB';
}

export function HomeIcon({ size = 28, color, active, className }: IconProps) {
  const c = iconColor(active, color);
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <path d="M5 14L16 5L27 14V26C27 27.1 26.1 28 25 28H7C5.9 28 5 27.1 5 26V14Z" fill={active ? c : 'none'} stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fillOpacity={active ? 0.2 : 0} />
      <path d="M12 28V18H20V28" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Chimney smoke */}
      {active && (
        <g className="animate-float-gentle">
          <circle cx="22" cy="5" r="1.5" fill={c} opacity="0.3" />
          <circle cx="23.5" cy="3" r="1" fill={c} opacity="0.2" />
        </g>
      )}
    </svg>
  );
}

export function LearnIcon({ size = 28, color, active, className }: IconProps) {
  const c = iconColor(active, color ?? '#4ECDC4');
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      {/* Open book */}
      <path d="M4 6C4 6 8 4 16 4C24 4 28 6 28 6V26C28 26 24 24 16 24C8 24 4 26 4 26V6Z" fill={active ? c : 'none'} stroke={c} strokeWidth="2.5" strokeLinejoin="round" fillOpacity={active ? 0.15 : 0} />
      <line x1="16" y1="4" x2="16" y2="24" stroke={c} strokeWidth="2" />
      {/* Stars */}
      {active && (
        <>
          <circle cx="10" cy="11" r="1.2" fill="#FFE66D" className="animate-sparkle" />
          <circle cx="22" cy="9" r="1" fill="#FFE66D" className="animate-sparkle stagger-2" />
        </>
      )}
    </svg>
  );
}

export function PlayIcon({ size = 28, color, active, className }: IconProps) {
  const c = iconColor(active, color ?? '#FF8C42');
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      {/* Game controller body */}
      <rect x="4" y="10" width="24" height="14" rx="7" fill={active ? c : 'none'} stroke={c} strokeWidth="2.5" fillOpacity={active ? 0.15 : 0} />
      {/* D-pad */}
      <rect x="9" y="14" width="2" height="6" rx="1" fill={c} />
      <rect x="7" y="16" width="6" height="2" rx="1" fill={c} />
      {/* Buttons */}
      <circle cx="22" cy="15" r="1.5" fill={active ? '#FF6B6B' : c} />
      <circle cx="25" cy="17" r="1.5" fill={active ? '#4ECDC4' : c} />
    </svg>
  );
}

export function CreateIcon({ size = 28, color, active, className }: IconProps) {
  const c = iconColor(active, color ?? '#A78BFA');
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      {/* Palette */}
      <ellipse cx="16" cy="17" rx="12" ry="10" fill={active ? c : 'none'} stroke={c} strokeWidth="2.5" fillOpacity={active ? 0.15 : 0} />
      {/* Paint dots */}
      <circle cx="11" cy="14" r="2" fill={active ? '#FF6B6B' : c} />
      <circle cx="16" cy="11" r="2" fill={active ? '#FFE66D' : c} />
      <circle cx="21" cy="14" r="2" fill={active ? '#4ECDC4' : c} />
      <circle cx="18" cy="20" r="2" fill={active ? '#6BCB77' : c} />
      {/* Thumb hole */}
      <circle cx="10" cy="20" r="2.5" fill="white" stroke={c} strokeWidth="1.5" />
    </svg>
  );
}

export function ListenIcon({ size = 28, color, active, className }: IconProps) {
  const c = iconColor(active, color ?? '#E11D48');
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      {/* Headphones */}
      <path d="M6 18V16C6 10.5 10.5 6 16 6C21.5 6 26 10.5 26 16V18" stroke={c} strokeWidth="2.5" strokeLinecap="round" />
      <rect x="4" y="18" width="5" height="8" rx="2.5" fill={active ? c : 'none'} stroke={c} strokeWidth="2" fillOpacity={active ? 0.3 : 0} />
      <rect x="23" y="18" width="5" height="8" rx="2.5" fill={active ? c : 'none'} stroke={c} strokeWidth="2" fillOpacity={active ? 0.3 : 0} />
      {/* Music notes */}
      {active && (
        <g className="animate-float-gentle">
          <text x="14" y="14" fontSize="7" fill="#FFE66D">&#9835;</text>
          <text x="19" y="11" fontSize="5" fill="#FF8FAB" className="stagger-2">&#9833;</text>
        </g>
      )}
    </svg>
  );
}

export function WellbeingIcon({ size = 28, color, active, className }: IconProps) {
  const c = iconColor(active, color ?? '#6BCB77');
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      {/* Heart */}
      <path d="M16 27S4 20 4 13C4 9.5 7 7 10 7C12.5 7 14.5 8.5 16 11C17.5 8.5 19.5 7 22 7C25 7 28 9.5 28 13C28 20 16 27 16 27Z" fill={active ? c : 'none'} stroke={c} strokeWidth="2.5" strokeLinejoin="round" fillOpacity={active ? 0.2 : 0} />
      {/* Pulse line */}
      {active && (
        <polyline points="9,17 12,17 14,13 16,20 18,15 20,17 23,17" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

export function ExploreIcon({ size = 28, color, active, className }: IconProps) {
  const c = iconColor(active, color ?? '#45B7D1');
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      {/* Compass body */}
      <circle cx="16" cy="16" r="12" fill={active ? c : 'none'} stroke={c} strokeWidth="2.5" fillOpacity={active ? 0.1 : 0} />
      {/* Compass needle */}
      <path d="M16 8L19 16L16 24L13 16Z" fill={active ? '#FF6B6B' : c} fillOpacity="0.6" stroke={c} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="16" cy="16" r="2" fill="white" stroke={c} strokeWidth="1.5" />
      {/* Direction marks */}
      <text x="14.5" y="7" fontSize="5" fontWeight="bold" fill={c}>N</text>
    </svg>
  );
}
