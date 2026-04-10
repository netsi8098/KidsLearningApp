import React from 'react';

interface MascotLionProps {
  size?: number;
  expression?: 'happy' | 'excited' | 'thinking' | 'sad' | 'waving' | 'celebrating' | 'sleeping';
  animated?: boolean;
  className?: string;
}

const MascotLion: React.FC<MascotLionProps> = ({
  size = 200,
  expression = 'happy',
  animated = true,
  className = '',
}) => {
  const renderMouth = () => {
    switch (expression) {
      case 'happy':
        return (
          <path
            d="M88 118 Q94 132 100 134 Q106 132 112 118"
            fill="none"
            stroke="#5D3A1A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        );
      case 'excited':
        return (
          <ellipse
            cx="100"
            cy="124"
            rx="8"
            ry="10"
            fill="#C0392B"
            stroke="#5D3A1A"
            strokeWidth="2"
          />
        );
      case 'thinking':
        return (
          <path
            d="M90 122 Q95 119 100 122 Q105 125 110 122"
            fill="none"
            stroke="#5D3A1A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        );
      case 'sad':
        return (
          <path
            d="M90 126 Q95 120 100 119 Q105 120 110 126"
            fill="none"
            stroke="#5D3A1A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        );
      case 'waving':
        return (
          <path
            d="M88 118 Q94 132 100 134 Q106 132 112 118"
            fill="none"
            stroke="#5D3A1A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        );
      case 'celebrating':
        return (
          <path
            d="M84 116 Q92 138 100 140 Q108 138 116 116"
            fill="#C0392B"
            stroke="#5D3A1A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        );
      case 'sleeping':
        return (
          <path
            d="M92 120 Q96 124 100 124 Q104 124 108 120"
            fill="none"
            stroke="#5D3A1A"
            strokeWidth="2"
            strokeLinecap="round"
          />
        );
      default:
        return (
          <path
            d="M88 118 Q94 132 100 134 Q106 132 112 118"
            fill="none"
            stroke="#5D3A1A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        );
    }
  };

  const renderEyes = () => {
    if (expression === 'sleeping') {
      return (
        <>
          {/* Closed left eye — curved line */}
          <path
            d="M82 96 Q86 92 90 96"
            fill="none"
            stroke="#5D3A1A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Closed right eye — curved line */}
          <path
            d="M110 96 Q114 92 118 96"
            fill="none"
            stroke="#5D3A1A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </>
      );
    }

    const leftPupilOffsetX = expression === 'thinking' ? -1 : 0;
    const leftPupilOffsetY = expression === 'thinking' ? -1 : 0;

    const sadEyeAngle = expression === 'sad';

    return (
      <>
        {/* Left eye white */}
        <ellipse
          cx="86"
          cy="96"
          rx="10"
          ry="12"
          fill="white"
          stroke="#5D3A1A"
          strokeWidth="2"
          className={animated ? 'animate-blink' : undefined}
          transform={sadEyeAngle ? 'rotate(8, 86, 96)' : undefined}
        />
        {/* Left pupil */}
        <circle
          cx={86 + leftPupilOffsetX}
          cy={97 + leftPupilOffsetY}
          r="5.5"
          fill="#1A1A2E"
        />
        {/* Left eye highlight */}
        <circle cx="83" cy="93" r="2.5" fill="white" />
        <circle cx="88" cy="95" r="1.2" fill="white" />

        {/* Right eye white */}
        <ellipse
          cx="114"
          cy="96"
          rx="10"
          ry="12"
          fill="white"
          stroke="#5D3A1A"
          strokeWidth="2"
          className={animated ? 'animate-blink' : undefined}
          transform={sadEyeAngle ? 'rotate(-8, 114, 96)' : undefined}
        />
        {/* Right pupil */}
        <circle cx="114" cy="97" r="5.5" fill="#1A1A2E" />
        {/* Right eye highlight */}
        <circle cx="111" cy="93" r="2.5" fill="white" />
        <circle cx="116" cy="95" r="1.2" fill="white" />

        {/* Thinking — raised left eyebrow */}
        {expression === 'thinking' && (
          <>
            <path
              d="M76 82 Q80 76 92 80"
              fill="none"
              stroke="#5D3A1A"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M108 82 Q112 80 120 84"
              fill="none"
              stroke="#5D3A1A"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </>
        )}

        {/* Sad — droopy eyebrows */}
        {expression === 'sad' && (
          <>
            <path
              d="M76 86 Q82 82 94 86"
              fill="none"
              stroke="#5D3A1A"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M106 86 Q118 82 124 86"
              fill="none"
              stroke="#5D3A1A"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </>
        )}
      </>
    );
  };

  const renderExpressionExtras = () => {
    switch (expression) {
      case 'excited':
        return (
          <>
            {/* Star 1 — top left */}
            <polygon
              points="68,52 70,46 72,52 78,52 73,56 75,62 70,58 65,62 67,56 62,52"
              fill="#FFD93D"
              stroke="#E6B800"
              strokeWidth="1"
              className={animated ? 'animate-sparkle' : undefined}
            />
            {/* Star 2 — top right */}
            <polygon
              points="132,48 134,42 136,48 142,48 137,52 139,58 134,54 129,58 131,52 126,48"
              fill="#FFD93D"
              stroke="#E6B800"
              strokeWidth="1"
              className={animated ? 'animate-sparkle' : undefined}
              style={{ animationDelay: '0.3s' }}
            />
            {/* Star 3 — top center */}
            <polygon
              points="100,38 102,32 104,38 110,38 105,42 107,48 102,44 97,48 99,42 94,38"
              fill="#FFE66D"
              stroke="#E6B800"
              strokeWidth="1"
              className={animated ? 'animate-sparkle' : undefined}
              style={{ animationDelay: '0.6s' }}
            />
          </>
        );
      case 'thinking':
        return (
          <>
            {/* Question mark floating above head */}
            <text
              x="118"
              y="42"
              fontSize="22"
              fontWeight="bold"
              fill="#A78BFA"
              stroke="#7C5CBF"
              strokeWidth="0.8"
              fontFamily="Comic Sans MS, cursive"
              className={animated ? 'animate-float' : undefined}
            >
              ?
            </text>
            {/* Thought dots */}
            <circle cx="112" cy="52" r="2.5" fill="#A78BFA" opacity="0.7" />
            <circle cx="108" cy="60" r="1.8" fill="#A78BFA" opacity="0.5" />
          </>
        );
      case 'sad':
        return (
          <>
            {/* Teardrop on right cheek */}
            <path
              d="M120 106 Q122 112 120 116 Q118 112 120 106"
              fill="#87CEEB"
              stroke="#5DA9D6"
              strokeWidth="1"
              className={animated ? 'animate-float' : undefined}
            />
          </>
        );
      case 'waving':
        return (
          <>
            {/* Speech bubble placeholder */}
            <rect
              x="130"
              y="60"
              width="42"
              height="28"
              rx="10"
              ry="10"
              fill="white"
              stroke="#D2691E"
              strokeWidth="1.5"
            />
            <polygon points="138,88 132,94 144,88" fill="white" stroke="#D2691E" strokeWidth="1.5" />
            {/* Cover the stroke overlap inside bubble */}
            <line x1="138" y1="88" x2="144" y2="88" stroke="white" strokeWidth="2" />
            {/* Three dots in bubble */}
            <circle cx="143" cy="74" r="2.5" fill="#D2691E" opacity="0.5" />
            <circle cx="151" cy="74" r="2.5" fill="#D2691E" opacity="0.7" />
            <circle cx="159" cy="74" r="2.5" fill="#D2691E" opacity="0.9" />
          </>
        );
      case 'celebrating':
        return (
          <>
            {/* Confetti dots */}
            <circle cx="58" cy="50" r="3" fill="#FF6B6B" className={animated ? 'animate-sparkle' : undefined} />
            <circle cx="142" cy="44" r="2.5" fill="#4ECDC4" className={animated ? 'animate-sparkle' : undefined} style={{ animationDelay: '0.2s' }} />
            <circle cx="48" cy="72" r="2" fill="#FFE66D" className={animated ? 'animate-sparkle' : undefined} style={{ animationDelay: '0.4s' }} />
            <circle cx="152" cy="68" r="2.5" fill="#A78BFA" className={animated ? 'animate-sparkle' : undefined} style={{ animationDelay: '0.1s' }} />
            <circle cx="70" cy="38" r="2" fill="#6BCB77" className={animated ? 'animate-sparkle' : undefined} style={{ animationDelay: '0.5s' }} />
            <circle cx="130" cy="34" r="3" fill="#FF8C42" className={animated ? 'animate-sparkle' : undefined} style={{ animationDelay: '0.3s' }} />
            {/* Small confetti rectangles */}
            <rect x="64" y="44" width="4" height="6" rx="1" fill="#FFD93D" transform="rotate(25, 66, 47)" className={animated ? 'animate-sparkle' : undefined} style={{ animationDelay: '0.15s' }} />
            <rect x="136" y="56" width="4" height="6" rx="1" fill="#FF6B6B" transform="rotate(-30, 138, 59)" className={animated ? 'animate-sparkle' : undefined} style={{ animationDelay: '0.45s' }} />
            <rect x="52" y="62" width="3" height="5" rx="1" fill="#4ECDC4" transform="rotate(15, 53, 65)" className={animated ? 'animate-sparkle' : undefined} style={{ animationDelay: '0.6s' }} />
          </>
        );
      case 'sleeping':
        return (
          <>
            {/* Zzz floating up */}
            <text
              x="120"
              y="72"
              fontSize="12"
              fontWeight="bold"
              fill="#A78BFA"
              opacity="0.9"
              fontFamily="Comic Sans MS, cursive"
              className={animated ? 'animate-float' : undefined}
            >
              Z
            </text>
            <text
              x="130"
              y="58"
              fontSize="10"
              fontWeight="bold"
              fill="#A78BFA"
              opacity="0.65"
              fontFamily="Comic Sans MS, cursive"
              className={animated ? 'animate-float' : undefined}
              style={{ animationDelay: '0.5s' }}
            >
              Z
            </text>
            <text
              x="138"
              y="46"
              fontSize="8"
              fontWeight="bold"
              fill="#A78BFA"
              opacity="0.4"
              fontFamily="Comic Sans MS, cursive"
              className={animated ? 'animate-float' : undefined}
              style={{ animationDelay: '1s' }}
            >
              Z
            </text>
          </>
        );
      default:
        return null;
    }
  };

  const renderArms = () => {
    if (expression === 'waving') {
      return (
        <>
          {/* Left arm — resting */}
          <path
            d="M72 148 Q62 152 58 162 Q56 168 60 170"
            fill="#F4A460"
            stroke="#D2841A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Left paw */}
          <ellipse cx="59" cy="168" rx="6" ry="5" fill="#F4A460" stroke="#D2841A" strokeWidth="2" />

          {/* Right arm — raised and waving */}
          <g className={animated ? 'animate-wave' : undefined} style={{ transformOrigin: '128px 148px' }}>
            <path
              d="M128 148 Q138 132 142 120 Q144 114 140 112"
              fill="#F4A460"
              stroke="#D2841A"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Right paw raised */}
            <ellipse cx="141" cy="113" rx="6" ry="5" fill="#F4A460" stroke="#D2841A" strokeWidth="2" />
          </g>
        </>
      );
    }

    if (expression === 'excited' || expression === 'celebrating') {
      return (
        <>
          {/* Left arm raised up */}
          <path
            d="M72 148 Q58 134 54 120 Q52 114 56 112"
            fill="#F4A460"
            stroke="#D2841A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <ellipse cx="55" cy="113" rx="6" ry="5" fill="#F4A460" stroke="#D2841A" strokeWidth="2" />

          {/* Right arm raised up */}
          <path
            d="M128 148 Q142 134 146 120 Q148 114 144 112"
            fill="#F4A460"
            stroke="#D2841A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <ellipse cx="145" cy="113" rx="6" ry="5" fill="#F4A460" stroke="#D2841A" strokeWidth="2" />
        </>
      );
    }

    if (expression === 'thinking') {
      return (
        <>
          {/* Left arm resting */}
          <path
            d="M72 148 Q62 152 58 162 Q56 168 60 170"
            fill="#F4A460"
            stroke="#D2841A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <ellipse cx="59" cy="168" rx="6" ry="5" fill="#F4A460" stroke="#D2841A" strokeWidth="2" />

          {/* Right arm — hand on chin */}
          <path
            d="M128 148 Q134 140 130 128 Q128 124 126 126"
            fill="#F4A460"
            stroke="#D2841A"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <ellipse cx="127" cy="125" rx="5" ry="4.5" fill="#F4A460" stroke="#D2841A" strokeWidth="2" />
        </>
      );
    }

    // Default arms — resting at sides
    return (
      <>
        {/* Left arm */}
        <path
          d="M72 148 Q62 152 58 162 Q56 168 60 170"
          fill="#F4A460"
          stroke="#D2841A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <ellipse cx="59" cy="168" rx="6" ry="5" fill="#F4A460" stroke="#D2841A" strokeWidth="2" />

        {/* Right arm */}
        <path
          d="M128 148 Q138 152 142 162 Q144 168 140 170"
          fill="#F4A460"
          stroke="#D2841A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <ellipse cx="141" cy="168" rx="6" ry="5" fill="#F4A460" stroke="#D2841A" strokeWidth="2" />
      </>
    );
  };

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Lion mascot with ${expression} expression`}
    >
      {/* === TAIL (behind body) === */}
      <g className={animated && (expression === 'happy' || expression === 'waving' || expression === 'celebrating') ? 'animate-tail-wag' : undefined} style={{ transformOrigin: '42px 162px' }}>
        {/* Tail curve */}
        <path
          d="M42 162 Q28 148 22 136 Q18 128 24 124"
          fill="none"
          stroke="#D2841A"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Tail tuft */}
        <ellipse cx="24" cy="122" rx="7" ry="6" fill="#D2691E" stroke="#B8541A" strokeWidth="1.5" />
      </g>

      {/* === BODY === */}
      <g className={animated && expression === 'celebrating' ? 'animate-float-gentle' : undefined}>
        {/* Torso — round/oval */}
        <ellipse
          cx="100"
          cy="158"
          rx="34"
          ry="30"
          fill="#F4A460"
          stroke="#D2841A"
          strokeWidth="2.5"
        />

        {/* Belly patch — lighter */}
        <ellipse cx="100" cy="162" rx="20" ry="18" fill="#FFDAA5" />

        {/* === LEGS === */}
        {/* Left leg */}
        <ellipse cx="82" cy="186" rx="10" ry="8" fill="#F4A460" stroke="#D2841A" strokeWidth="2" />
        {/* Left foot pad */}
        <ellipse cx="82" cy="188" rx="6" ry="4" fill="#E89440" />

        {/* Right leg */}
        <ellipse cx="118" cy="186" rx="10" ry="8" fill="#F4A460" stroke="#D2841A" strokeWidth="2" />
        {/* Right foot pad */}
        <ellipse cx="118" cy="188" rx="6" ry="4" fill="#E89440" />

        {/* === MANE (behind head) === */}
        {/* Scalloped mane — overlapping circles forming a fluffy ring */}
        <circle cx="100" cy="66" r="10" fill="#D2691E" stroke="#B8541A" strokeWidth="1.5" />
        <circle cx="116" cy="68" r="10" fill="#D2691E" stroke="#B8541A" strokeWidth="1.5" />
        <circle cx="128" cy="76" r="10" fill="#D2691E" stroke="#B8541A" strokeWidth="1.5" />
        <circle cx="134" cy="88" r="10" fill="#D2691E" stroke="#B8541A" strokeWidth="1.5" />
        <circle cx="132" cy="102" r="10" fill="#D2691E" stroke="#B8541A" strokeWidth="1.5" />
        <circle cx="126" cy="114" r="10" fill="#D2691E" stroke="#B8541A" strokeWidth="1.5" />
        <circle cx="114" cy="120" r="10" fill="#D2691E" stroke="#B8541A" strokeWidth="1.5" />
        <circle cx="100" cy="124" r="10" fill="#D2691E" stroke="#B8541A" strokeWidth="1.5" />
        <circle cx="86" cy="120" r="10" fill="#D2691E" stroke="#B8541A" strokeWidth="1.5" />
        <circle cx="74" cy="114" r="10" fill="#D2691E" stroke="#B8541A" strokeWidth="1.5" />
        <circle cx="68" cy="102" r="10" fill="#D2691E" stroke="#B8541A" strokeWidth="1.5" />
        <circle cx="66" cy="88" r="10" fill="#D2691E" stroke="#B8541A" strokeWidth="1.5" />
        <circle cx="72" cy="76" r="10" fill="#D2691E" stroke="#B8541A" strokeWidth="1.5" />
        <circle cx="84" cy="68" r="10" fill="#D2691E" stroke="#B8541A" strokeWidth="1.5" />

        {/* === EARS (poking through mane) === */}
        {/* Left ear */}
        <ellipse cx="74" cy="68" rx="8" ry="9" fill="#F4A460" stroke="#D2841A" strokeWidth="2" />
        <ellipse cx="74" cy="68" rx="4.5" ry="5.5" fill="#FFB6C1" />

        {/* Right ear */}
        <ellipse cx="126" cy="68" rx="8" ry="9" fill="#F4A460" stroke="#D2841A" strokeWidth="2" />
        <ellipse cx="126" cy="68" rx="4.5" ry="5.5" fill="#FFB6C1" />

        {/* === HEAD (over mane) === */}
        <ellipse
          cx="100"
          cy="94"
          rx="30"
          ry="28"
          fill="#F4A460"
          stroke="#D2841A"
          strokeWidth="2.5"
        />

        {/* === EYES === */}
        {renderEyes()}

        {/* === NOSE === */}
        <path
          d="M96 108 L100 114 L104 108 Z"
          fill="#5D3A1A"
          stroke="#3D2510"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* === CHEEKS (rosy pink) === */}
        <circle cx="74" cy="108" r="7" fill="#FFB6C1" opacity="0.5" />
        <circle cx="126" cy="108" r="7" fill="#FFB6C1" opacity="0.5" />

        {/* === MOUTH === */}
        {renderMouth()}

        {/* Nose-to-mouth line */}
        <line
          x1="100"
          y1="114"
          x2="100"
          y2="117"
          stroke="#5D3A1A"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Whisker dots */}
        <circle cx="80" cy="112" r="1" fill="#D2841A" />
        <circle cx="76" cy="110" r="1" fill="#D2841A" />
        <circle cx="76" cy="114" r="1" fill="#D2841A" />
        <circle cx="120" cy="112" r="1" fill="#D2841A" />
        <circle cx="124" cy="110" r="1" fill="#D2841A" />
        <circle cx="124" cy="114" r="1" fill="#D2841A" />

        {/* === ARMS === */}
        {renderArms()}

        {/* === EXPRESSION EXTRAS (stars, question mark, Zzz, confetti, etc.) === */}
        {renderExpressionExtras()}
      </g>
    </svg>
  );
};

export default React.memo(MascotLion);
