interface CategoryIconProps {
  category:
    | 'abc'
    | 'numbers'
    | 'colors'
    | 'shapes'
    | 'animals'
    | 'body'
    | 'stories'
    | 'games'
    | 'music'
    | 'art'
    | 'videos'
    | 'emotions'
    | 'cooking'
    | 'nature';
  size?: number;
  className?: string;
}

export default function CategoryIcon({
  category,
  size = 40,
  className = '',
}: CategoryIconProps) {
  const svgProps = {
    width: size,
    height: size,
    className,
    'aria-hidden': true as const,
  };

  switch (category) {
    // Stylized "A" with playful curves in coral
    case 'abc':
      return (
        <svg {...svgProps} viewBox="0 0 40 40">
          <circle cx={20} cy={20} r={18} fill="#FFF0F0" />
          <text
            x={20}
            y={27}
            textAnchor="middle"
            fontFamily="system-ui, sans-serif"
            fontWeight={800}
            fontSize={22}
            fill="#FF6B6B"
          >
            A
          </text>
          <circle cx={32} cy={10} r={3} fill="#4ECDC4" />
        </svg>
      );

    // "123" in a rounded badge in teal
    case 'numbers':
      return (
        <svg {...svgProps} viewBox="0 0 40 40">
          <rect x={2} y={6} width={36} height={28} rx={12} fill="#EDFAF8" />
          <text
            x={20}
            y={26}
            textAnchor="middle"
            fontFamily="system-ui, sans-serif"
            fontWeight={800}
            fontSize={16}
            fill="#4ECDC4"
          >
            123
          </text>
        </svg>
      );

    // Paint palette with 3 dots
    case 'colors':
      return (
        <svg {...svgProps} viewBox="0 0 40 40">
          <ellipse cx={20} cy={22} rx={16} ry={14} fill="#FFF0F0" />
          <circle cx={13} cy={18} r={4} fill="#FF6B6B" />
          <circle cx={22} cy={14} r={4} fill="#4ECDC4" />
          <circle cx={28} cy={22} r={4} fill="#FFE66D" />
          <circle cx={14} cy={28} r={2.5} fill="#FFF8F0" />
        </svg>
      );

    // Overlapping circle + triangle + square
    case 'shapes':
      return (
        <svg {...svgProps} viewBox="0 0 40 40">
          <rect x={18} y={18} width={16} height={16} rx={3} fill="#FF6B6B" opacity={0.7} />
          <polygon points="10,6 20,24 0,24" fill="#4ECDC4" opacity={0.7} />
          <circle cx={14} cy={24} r={9} fill="#A78BFA" opacity={0.6} />
        </svg>
      );

    // Cute paw print in leaf green
    case 'animals':
      return (
        <svg {...svgProps} viewBox="0 0 40 40">
          <ellipse cx={20} cy={26} rx={9} ry={7} fill="#6BCB77" />
          <circle cx={11} cy={16} r={4} fill="#6BCB77" />
          <circle cx={20} cy={13} r={4} fill="#6BCB77" />
          <circle cx={29} cy={16} r={4} fill="#6BCB77" />
          <circle cx={14} cy={22} r={2.5} fill="#EDFAEF" />
          <circle cx={20} cy={20} r={2.5} fill="#EDFAEF" />
          <circle cx={26} cy={22} r={2.5} fill="#EDFAEF" />
        </svg>
      );

    // Simple smiling figure in pink
    case 'body':
      return (
        <svg {...svgProps} viewBox="0 0 40 40">
          <circle cx={20} cy={12} r={7} fill="#FD79A8" />
          <ellipse cx={20} cy={30} rx={10} ry={8} fill="#FD79A8" />
          <circle cx={17} cy={11} r={1.2} fill="white" />
          <circle cx={23} cy={11} r={1.2} fill="white" />
          <path
            d="M17,14 Q20,17 23,14"
            fill="none"
            stroke="white"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </svg>
      );

    // Open book with pages in grape
    case 'stories':
      return (
        <svg {...svgProps} viewBox="0 0 40 40">
          <path
            d="M20,10 C14,8 6,9 4,12 L4,32 C6,29 14,28 20,30 C26,28 34,29 36,32 L36,12 C34,9 26,8 20,10 Z"
            fill="#F3EFFE"
            stroke="#A78BFA"
            strokeWidth={1.5}
          />
          <line x1={20} y1={10} x2={20} y2={30} stroke="#A78BFA" strokeWidth={1.2} strokeLinecap="round" />
          <line x1={9} y1={16} x2={17} y2={15} stroke="#A78BFA" strokeWidth={1.2} strokeLinecap="round" opacity={0.5} />
          <line x1={9} y1={20} x2={17} y2={19} stroke="#A78BFA" strokeWidth={1.2} strokeLinecap="round" opacity={0.5} />
          <line x1={23} y1={15} x2={31} y2={16} stroke="#A78BFA" strokeWidth={1.2} strokeLinecap="round" opacity={0.5} />
          <line x1={23} y1={19} x2={31} y2={20} stroke="#A78BFA" strokeWidth={1.2} strokeLinecap="round" opacity={0.5} />
        </svg>
      );

    // Game controller in tangerine
    case 'games':
      return (
        <svg {...svgProps} viewBox="0 0 40 40">
          <rect x={5} y={12} width={30} height={18} rx={9} fill="#FFF3EB" stroke="#FF8C42" strokeWidth={1.5} />
          <circle cx={14} cy={21} r={2.5} fill="#FF8C42" />
          <rect x={11.5} y={18} width={5} height={6} rx={1} fill="none" stroke="#FF8C42" strokeWidth={1.5} />
          <circle cx={27} cy={18} r={2} fill="#FF6B6B" />
          <circle cx={31} cy={22} r={2} fill="#4ECDC4" />
        </svg>
      );

    // Musical note with sound waves in teal
    case 'music':
      return (
        <svg {...svgProps} viewBox="0 0 40 40">
          <circle cx={14} cy={28} r={5} fill="#4ECDC4" />
          <rect x={18} y={8} width={3} height={20} rx={1.5} fill="#4ECDC4" />
          <path
            d="M21,8 C21,8 30,6 30,12"
            fill="none"
            stroke="#4ECDC4"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <path d="M30,14 C33,16 33,22 30,24" fill="none" stroke="#FFE66D" strokeWidth={1.5} strokeLinecap="round" />
          <path d="M33,12 C37,15 37,24 33,27" fill="none" stroke="#FFE66D" strokeWidth={1.5} strokeLinecap="round" opacity={0.6} />
        </svg>
      );

    // Paintbrush with stroke in grape
    case 'art':
      return (
        <svg {...svgProps} viewBox="0 0 40 40">
          <path
            d="M8,32 Q12,24 28,8"
            fill="none"
            stroke="#A78BFA"
            strokeWidth={4}
            strokeLinecap="round"
          />
          <path
            d="M28,8 L33,6 L35,11 L30,12 Z"
            fill="#FF8C42"
          />
          <circle cx={10} cy={30} r={4} fill="#A78BFA" opacity={0.3} />
          <circle cx={16} cy={26} r={2.5} fill="#FF6B6B" opacity={0.4} />
        </svg>
      );

    // Play button in a rounded rectangle in coral
    case 'videos':
      return (
        <svg {...svgProps} viewBox="0 0 40 40">
          <rect x={4} y={8} width={32} height={24} rx={6} fill="#FFF0F0" stroke="#FF6B6B" strokeWidth={1.5} />
          <polygon points="16,14 28,20 16,26" fill="#FF6B6B" />
        </svg>
      );

    // Heart with smile in leaf
    case 'emotions':
      return (
        <svg {...svgProps} viewBox="0 0 40 40">
          <path
            d="M20,34 C14,28 4,22 4,14 C4,8 8,4 14,4 C17,4 19,6 20,8 C21,6 23,4 26,4 C32,4 36,8 36,14 C36,22 26,28 20,34 Z"
            fill="#6BCB77"
          />
          <circle cx={15} cy={16} r={1.5} fill="white" />
          <circle cx={25} cy={16} r={1.5} fill="white" />
          <path
            d="M16,22 Q20,26 24,22"
            fill="none"
            stroke="white"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </svg>
      );

    // Chef hat in tangerine
    case 'cooking':
      return (
        <svg {...svgProps} viewBox="0 0 40 40">
          <ellipse cx={20} cy={14} rx={12} ry={10} fill="white" stroke="#FF8C42" strokeWidth={1.5} />
          <rect x={10} y={22} width={20} height={8} rx={2} fill="white" stroke="#FF8C42" strokeWidth={1.5} />
          <circle cx={14} cy={12} r={3} fill="#FFE66D" opacity={0.5} />
          <circle cx={20} cy={9} r={3} fill="#FF8C42" opacity={0.3} />
          <circle cx={26} cy={12} r={3} fill="#FF6B6B" opacity={0.3} />
          <line x1={10} y1={22} x2={30} y2={22} stroke="#FF8C42" strokeWidth={1.5} />
        </svg>
      );

    // Leaf / tree in leaf green
    case 'nature':
      return (
        <svg {...svgProps} viewBox="0 0 40 40">
          <path
            d="M20,4 C10,4 4,14 4,22 C4,30 12,36 20,36 C28,36 36,30 36,22 C36,14 30,4 20,4 Z"
            fill="#EDFAEF"
          />
          <path
            d="M20,8 C14,12 10,20 12,28"
            fill="none"
            stroke="#6BCB77"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <path
            d="M20,14 C24,16 28,22 26,30"
            fill="none"
            stroke="#6BCB77"
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={0.6}
          />
          <path
            d="M20,8 L20,34"
            stroke="#6BCB77"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </svg>
      );
  }
}
