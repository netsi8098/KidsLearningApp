/**
 * SubjectIcons — SVG illustrations for learning subject cards.
 * Replaces emojis with cute flat cartoon illustrations.
 */

interface IconProps {
  size?: number;
  className?: string;
}

/** ABCs: Letter A made of apples with worm */
export function AbcIcon({ size = 80, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
      {/* Letter A body */}
      <path d="M20 65L40 15L60 65" stroke="#FF6B6B" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="28" y1="48" x2="52" y2="48" stroke="#FF6B6B" strokeWidth="5" strokeLinecap="round" />
      {/* Apple on top */}
      <circle cx="40" cy="18" r="8" fill="#FF6B6B" />
      <ellipse cx="40" cy="16" rx="3" ry="2" fill="#FF8E8E" />
      <path d="M40 10V7" stroke="#6BCB77" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="43" cy="8" rx="3" ry="2" fill="#6BCB77" transform="rotate(-30 43 8)" />
      {/* Cute worm */}
      <g className="animate-wiggle" style={{ transformOrigin: '55px 35px' }}>
        <circle cx="55" cy="35" r="4" fill="#6BCB77" />
        <circle cx="52" cy="39" r="3.5" fill="#5FBA6C" />
        <circle cx="55" cy="35" r="4" fill="#6BCB77" />
        <circle cx="56" cy="33.5" r="1" fill="#2D2D3A" />
        <circle cx="53.5" cy="33.5" r="1" fill="#2D2D3A" />
        <path d="M54 36C54.5 36.5 55.5 36.5 56 36" stroke="#2D2D3A" strokeWidth="0.8" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** Numbers: Smiling number 1 with arms and legs */
export function NumbersIcon({ size = 80, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
      {/* Number 1 body */}
      <path d="M30 20L42 12V62" stroke="#4ECDC4" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="30" y1="62" x2="55" y2="62" stroke="#4ECDC4" strokeWidth="6" strokeLinecap="round" />
      {/* Face on the 1 */}
      <circle cx="44" cy="30" r="2" fill="#2D2D3A" />
      <circle cx="38" cy="30" r="2" fill="#2D2D3A" />
      <path d="M38 35C39 37 43 37 44 35" stroke="#2D2D3A" strokeWidth="1.5" strokeLinecap="round" />
      {/* Arms */}
      <g className="animate-wave" style={{ transformOrigin: '50px 38px' }}>
        <path d="M48 38L58 32" stroke="#4ECDC4" strokeWidth="3" strokeLinecap="round" />
        <circle cx="59" cy="31" r="3" fill="#4ECDC4" />
      </g>
      <path d="M34 40L24 35" stroke="#4ECDC4" strokeWidth="3" strokeLinecap="round" />
      <circle cx="23" cy="34" r="3" fill="#4ECDC4" />
      {/* Legs */}
      <path d="M38 62L32 72" stroke="#4ECDC4" strokeWidth="3" strokeLinecap="round" />
      <path d="M46 62L52 72" stroke="#4ECDC4" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="31" cy="73" rx="4" ry="2" fill="#4ECDC4" />
      <ellipse cx="53" cy="73" rx="4" ry="2" fill="#4ECDC4" />
    </svg>
  );
}

/** Colors: Rainbow arc with paint bucket */
export function ColorsIcon({ size = 80, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
      {/* Rainbow arcs */}
      <path d="M10 55C10 30 25 15 40 15C55 15 70 30 70 55" stroke="#FF6B6B" strokeWidth="4" fill="none" />
      <path d="M16 55C16 34 27 21 40 21C53 21 64 34 64 55" stroke="#FFE66D" strokeWidth="4" fill="none" />
      <path d="M22 55C22 38 29 27 40 27C51 27 58 38 58 55" stroke="#6BCB77" strokeWidth="4" fill="none" />
      <path d="M28 55C28 42 33 33 40 33C47 33 52 42 52 55" stroke="#4ECDC4" strokeWidth="4" fill="none" />
      <path d="M34 55C34 46 36 39 40 39C44 39 46 46 46 55" stroke="#A78BFA" strokeWidth="4" fill="none" />
      {/* Paint bucket */}
      <rect x="54" y="50" width="18" height="20" rx="3" fill="#FFE66D" stroke="#F59E0B" strokeWidth="2" />
      <path d="M54 56H72" stroke="#F59E0B" strokeWidth="2" />
      <path d="M58 50C58 47 66 47 66 50" stroke="#F59E0B" strokeWidth="2" fill="none" />
      {/* Smiling face on bucket */}
      <circle cx="60" cy="63" r="1.2" fill="#2D2D3A" />
      <circle cx="66" cy="63" r="1.2" fill="#2D2D3A" />
      <path d="M60 66C61.5 67.5 64.5 67.5 66 66" stroke="#2D2D3A" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

/** Shapes: Stacked colorful shapes */
export function ShapesIcon({ size = 80, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
      {/* Square base */}
      <rect x="22" y="48" width="24" height="24" rx="3" fill="#A78BFA" fillOpacity="0.8" stroke="#8B5CF6" strokeWidth="2.5" />
      {/* Circle */}
      <circle cx="52" cy="42" r="14" fill="#FF6B6B" fillOpacity="0.8" stroke="#EF4444" strokeWidth="2.5" />
      {/* Triangle on top */}
      <path d="M28 48L40 22L52 48" fill="#FFE66D" fillOpacity="0.8" stroke="#F59E0B" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Star decoration */}
      <path d="M62 18L64 24L70 24L65 28L67 34L62 30L57 34L59 28L54 24L60 24Z" fill="#4ECDC4" stroke="#2DD4BF" strokeWidth="1.5" />
      {/* Face on triangle */}
      <circle cx="37" cy="38" r="1.2" fill="#2D2D3A" />
      <circle cx="43" cy="38" r="1.2" fill="#2D2D3A" />
      <path d="M38 41C39 42 41 42 42 41" stroke="#2D2D3A" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

/** Animals: Cute lion face peeking out */
export function AnimalsIcon({ size = 80, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
      {/* Grass/bush */}
      <ellipse cx="40" cy="70" rx="35" ry="15" fill="#6BCB77" />
      <ellipse cx="25" cy="65" rx="12" ry="10" fill="#5FBA6C" />
      <ellipse cx="55" cy="65" rx="12" ry="10" fill="#5FBA6C" />
      {/* Mane */}
      <circle cx="40" cy="40" r="22" fill="#D2691E" />
      {/* Face */}
      <circle cx="40" cy="42" r="16" fill="#F4A460" />
      {/* Eyes */}
      <ellipse cx="34" cy="38" rx="3" ry="3.5" fill="white" />
      <ellipse cx="46" cy="38" rx="3" ry="3.5" fill="white" />
      <circle cx="35" cy="38.5" r="2" fill="#2D2D3A" />
      <circle cx="47" cy="38.5" r="2" fill="#2D2D3A" />
      <circle cx="35.8" cy="37.5" r="0.8" fill="white" />
      <circle cx="47.8" cy="37.5" r="0.8" fill="white" />
      {/* Nose */}
      <ellipse cx="40" cy="45" rx="3" ry="2" fill="#8B4513" />
      {/* Mouth */}
      <path d="M37 47C38.5 49 41.5 49 43 47" stroke="#8B4513" strokeWidth="1.5" strokeLinecap="round" />
      {/* Cheeks */}
      <circle cx="30" cy="45" r="3" fill="#FFB6C1" fillOpacity="0.5" />
      <circle cx="50" cy="45" r="3" fill="#FFB6C1" fillOpacity="0.5" />
      {/* Ears */}
      <circle cx="24" cy="26" r="5" fill="#D2691E" />
      <circle cx="24" cy="26" r="3" fill="#FFB6C1" />
      <circle cx="56" cy="26" r="5" fill="#D2691E" />
      <circle cx="56" cy="26" r="3" fill="#FFB6C1" />
    </svg>
  );
}

/** Body: Cartoon character doing jumping jack */
export function BodyIcon({ size = 80, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
      {/* Head */}
      <circle cx="40" cy="18" r="10" fill="#FFD5B8" stroke="#E8A87C" strokeWidth="2" />
      {/* Hair */}
      <path d="M30 15C30 10 35 6 40 6C45 6 50 10 50 15" fill="#8B4513" />
      {/* Eyes */}
      <circle cx="37" cy="17" r="1.5" fill="#2D2D3A" />
      <circle cx="43" cy="17" r="1.5" fill="#2D2D3A" />
      <path d="M38 21C39 22 41 22 42 21" stroke="#2D2D3A" strokeWidth="1" strokeLinecap="round" />
      {/* Body/shirt */}
      <rect x="32" y="28" width="16" height="18" rx="4" fill="#FF6B6B" />
      {/* Arms up */}
      <path d="M32 32L18 18" stroke="#FFD5B8" strokeWidth="4" strokeLinecap="round" />
      <path d="M48 32L62 18" stroke="#FFD5B8" strokeWidth="4" strokeLinecap="round" />
      <circle cx="17" cy="17" r="3" fill="#FFD5B8" />
      <circle cx="63" cy="17" r="3" fill="#FFD5B8" />
      {/* Shorts */}
      <rect x="33" y="44" width="14" height="8" rx="2" fill="#4ECDC4" />
      {/* Legs apart */}
      <path d="M36 52L24 68" stroke="#FFD5B8" strokeWidth="4" strokeLinecap="round" />
      <path d="M44 52L56 68" stroke="#FFD5B8" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="23" cy="70" rx="5" ry="3" fill="#FF6B6B" />
      <ellipse cx="57" cy="70" rx="5" ry="3" fill="#FF6B6B" />
    </svg>
  );
}

/** Lessons: Schoolbook with star */
export function LessonsIcon({ size = 80, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
      {/* Book body */}
      <rect x="15" y="12" width="50" height="56" rx="4" fill="#EC4899" fillOpacity="0.9" stroke="#DB2777" strokeWidth="2.5" />
      <rect x="18" y="12" width="4" height="56" fill="#DB2777" fillOpacity="0.5" />
      {/* Book pages edge */}
      <line x1="22" y1="15" x2="22" y2="65" stroke="white" strokeWidth="1" strokeOpacity="0.5" />
      {/* Star on cover */}
      <path d="M42 28L45 37L54 37L47 42L49 51L42 46L35 51L37 42L30 37L39 37Z" fill="#FFE66D" stroke="#F59E0B" strokeWidth="1.5" />
      {/* Title lines */}
      <line x1="30" y1="57" x2="56" y2="57" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7" />
      <line x1="34" y1="61" x2="52" y2="61" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />
    </svg>
  );
}

/** World: Globe with airplane */
export function WorldIcon({ size = 80, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
      {/* Globe */}
      <circle cx="40" cy="42" r="24" fill="#45B7D1" fillOpacity="0.8" stroke="#0EA5E9" strokeWidth="2.5" />
      {/* Continents */}
      <ellipse cx="35" cy="35" rx="8" ry="10" fill="#6BCB77" fillOpacity="0.8" />
      <ellipse cx="50" cy="42" rx="6" ry="8" fill="#6BCB77" fillOpacity="0.8" />
      <ellipse cx="38" cy="55" rx="5" ry="4" fill="#6BCB77" fillOpacity="0.6" />
      {/* Grid lines */}
      <ellipse cx="40" cy="42" rx="24" ry="10" fill="none" stroke="#0EA5E9" strokeWidth="1" strokeOpacity="0.3" />
      <line x1="40" y1="18" x2="40" y2="66" stroke="#0EA5E9" strokeWidth="1" strokeOpacity="0.3" />
      {/* Airplane */}
      <g className="animate-float-gentle" style={{ transformOrigin: '60px 20px' }}>
        <path d="M56 22L66 18L62 22L66 26L56 22Z" fill="#FF6B6B" />
        <circle cx="55" cy="22" r="2" fill="white" stroke="#FF6B6B" strokeWidth="1" />
        {/* Trail */}
        <path d="M52 22C48 22 44 24 40 26" stroke="#FF6B6B" strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.5" />
      </g>
    </svg>
  );
}

/** Quiz: Brain character at buzzer */
export function QuizIcon({ size = 80, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
      {/* Brain body */}
      <ellipse cx="40" cy="35" rx="20" ry="18" fill="#FF8FAB" stroke="#F472B6" strokeWidth="2" />
      <path d="M25 30C25 25 35 20 40 25C45 20 55 25 55 30" stroke="#F472B6" strokeWidth="2" fill="none" />
      <line x1="40" y1="20" x2="40" y2="50" stroke="#F472B6" strokeWidth="1.5" strokeOpacity="0.5" />
      {/* Face */}
      <circle cx="34" cy="33" r="2" fill="#2D2D3A" />
      <circle cx="46" cy="33" r="2" fill="#2D2D3A" />
      <path d="M36 39C38 41 42 41 44 39" stroke="#2D2D3A" strokeWidth="1.5" strokeLinecap="round" />
      {/* Question marks */}
      <text x="58" y="20" fontSize="14" fontWeight="bold" fill="#FFE66D" className="animate-float-gentle">?</text>
      <text x="14" y="25" fontSize="10" fontWeight="bold" fill="#4ECDC4" className="animate-float">?</text>
      {/* Buzzer */}
      <rect x="32" y="55" width="16" height="6" rx="3" fill="#FF6B6B" />
      <rect x="36" y="61" width="8" height="10" rx="2" fill="#EF4444" />
    </svg>
  );
}

/** Matching: Cards flipping */
export function MatchingIcon({ size = 80, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
      {/* Card 1 (face up) */}
      <rect x="8" y="15" width="28" height="36" rx="4" fill="white" stroke="#4ECDC4" strokeWidth="2.5" />
      <text x="16" y="40" fontSize="20" fill="#4ECDC4">&#9733;</text>
      {/* Card 2 (face down — rainbow pattern) */}
      <rect x="44" y="15" width="28" height="36" rx="4" fill="#A78BFA" stroke="#8B5CF6" strokeWidth="2.5" />
      <text x="52" y="38" fontSize="16" fill="white" fontWeight="bold">?</text>
      {/* Card 3 (peeking) */}
      <rect x="20" y="45" width="28" height="28" rx="4" fill="#FFE66D" stroke="#F59E0B" strokeWidth="2" transform="rotate(-5 20 45)" />
      <circle cx="34" cy="56" r="5" fill="#FF6B6B" />
      {/* Sparkle */}
      <circle cx="65" cy="10" r="2" fill="#FFE66D" className="animate-sparkle" />
    </svg>
  );
}

/** Games: Joystick character */
export function GamesIcon({ size = 80, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
      {/* Joystick base */}
      <ellipse cx="40" cy="65" rx="22" ry="6" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="2" />
      {/* Stick */}
      <rect x="37" y="30" width="6" height="35" rx="3" fill="#6B7280" />
      {/* Ball top */}
      <circle cx="40" cy="25" r="12" fill="#FF6B6B" stroke="#EF4444" strokeWidth="2.5" />
      {/* Face */}
      <circle cx="36" cy="23" r="1.5" fill="white" />
      <circle cx="44" cy="23" r="1.5" fill="white" />
      <circle cx="36.5" cy="23.5" r="0.8" fill="#2D2D3A" />
      <circle cx="44.5" cy="23.5" r="0.8" fill="#2D2D3A" />
      <path d="M37 28C38.5 29.5 41.5 29.5 43 28" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      {/* Stars */}
      <circle cx="18" cy="18" r="2" fill="#FFE66D" className="animate-sparkle" />
      <circle cx="62" cy="15" r="1.5" fill="#FFE66D" className="animate-sparkle stagger-3" />
    </svg>
  );
}

/** Movement: Dancing animal characters */
export function MovementIcon({ size = 80, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" className={className}>
      {/* Dancing bear */}
      <circle cx="40" cy="30" r="12" fill="#D2691E" />
      <circle cx="40" cy="32" r="9" fill="#DEB887" />
      {/* Ears */}
      <circle cx="30" cy="22" r="4" fill="#D2691E" />
      <circle cx="30" cy="22" r="2.5" fill="#FFB6C1" />
      <circle cx="50" cy="22" r="4" fill="#D2691E" />
      <circle cx="50" cy="22" r="2.5" fill="#FFB6C1" />
      {/* Face */}
      <circle cx="36" cy="30" r="1.5" fill="#2D2D3A" />
      <circle cx="44" cy="30" r="1.5" fill="#2D2D3A" />
      <ellipse cx="40" cy="34" rx="2" ry="1.5" fill="#2D2D3A" />
      <path d="M38 36C39 37 41 37 42 36" stroke="#2D2D3A" strokeWidth="1" strokeLinecap="round" />
      {/* Body */}
      <ellipse cx="40" cy="52" rx="10" ry="12" fill="#D2691E" />
      {/* Dancing arms */}
      <path d="M30 48L18 38" stroke="#D2691E" strokeWidth="4" strokeLinecap="round" />
      <path d="M50 48L62 38" stroke="#D2691E" strokeWidth="4" strokeLinecap="round" />
      {/* Legs */}
      <path d="M34 62L28 72" stroke="#D2691E" strokeWidth="4" strokeLinecap="round" />
      <path d="M46 62L52 72" stroke="#D2691E" strokeWidth="4" strokeLinecap="round" />
      {/* Music notes */}
      <text x="60" y="25" fontSize="10" fill="#A78BFA" className="animate-float-gentle">&#9835;</text>
      <text x="14" y="30" fontSize="8" fill="#FF6B6B" className="animate-float">&#9833;</text>
    </svg>
  );
}
