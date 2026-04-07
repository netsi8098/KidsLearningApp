import { motion } from 'framer-motion';

export type AvatarFrameSize = 'sm' | 'md' | 'lg' | 'xl';
export type AvatarFrameType = 'basic' | 'star' | 'crown' | 'rainbow' | 'sparkle' | 'nature';

export interface AvatarFrameProps {
  emoji: string;
  /** Base64 data URL for photo avatar. When set, shown instead of emoji. */
  photo?: string;
  color?: string;
  /** @deprecated Use `color` instead */
  accentColor?: string;
  size?: AvatarFrameSize;
  frameType?: AvatarFrameType;
  badge?: string;
  animated?: boolean;
  spotlight?: boolean;
  /** @deprecated Use `spotlight` instead */
  glowing?: boolean;
  className?: string;
}

const sizeConfig: Record<
  AvatarFrameSize,
  {
    outer: number;
    fontSize: string;
    badgeSize: number;
    badgeFont: string;
    strokeWidth: number;
  }
> = {
  sm: { outer: 48, fontSize: '1.5rem', badgeSize: 18, badgeFont: '0.625rem', strokeWidth: 2 },
  md: { outer: 72, fontSize: '2.25rem', badgeSize: 22, badgeFont: '0.75rem', strokeWidth: 3 },
  lg: { outer: 96, fontSize: '3rem', badgeSize: 26, badgeFont: '0.875rem', strokeWidth: 3 },
  xl: { outer: 128, fontSize: '4rem', badgeSize: 32, badgeFont: '1rem', strokeWidth: 4 },
};

/* ── Frame Renderers ─────────────────────────────────── */

function BasicFrame({ cx, cy, r, sw, color }: { cx: number; cy: number; r: number; sw: number; color: string }) {
  return <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={sw} />;
}

function StarFrame({ cx, cy, r, sw, color }: { cx: number; cy: number; r: number; sw: number; color: string }) {
  // Ring + 5 tiny star points evenly spaced
  const starPoints: { x: number; y: number; angle: number }[] = [];
  for (let i = 0; i < 5; i++) {
    const angle = (i * 72 - 90) * (Math.PI / 180);
    starPoints.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      angle: i * 72 - 90,
    });
  }
  const starSize = sw * 1.2;

  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={sw} />
      {starPoints.map((pt, i) => (
        <polygon
          key={i}
          points={generateMiniStar(pt.x, pt.y, starSize)}
          fill="#FFD93D"
          stroke="#FFD93D"
          strokeWidth={0.3}
        />
      ))}
    </>
  );
}

function generateMiniStar(cx: number, cy: number, size: number): string {
  const points: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = (i * 36 - 90) * (Math.PI / 180);
    const r = i % 2 === 0 ? size : size * 0.4;
    points.push(`${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`);
  }
  return points.join(' ');
}

function CrownFrame({ cx, cy, r, sw, color }: { cx: number; cy: number; r: number; sw: number; color: string }) {
  // Ring + crown at top
  const crownW = sw * 4;
  const crownH = sw * 3;
  const crownX = cx - crownW / 2;
  const crownY = cy - r - crownH * 0.6;

  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={sw} />
      <g transform={`translate(${crownX}, ${crownY})`}>
        <polygon
          points={`0,${crownH} ${crownW * 0.15},${crownH * 0.3} ${crownW * 0.35},${crownH * 0.65} ${crownW * 0.5},${crownH * 0.1} ${crownW * 0.65},${crownH * 0.65} ${crownW * 0.85},${crownH * 0.3} ${crownW},${crownH}`}
          fill="#FFD93D"
          stroke="#FF8C42"
          strokeWidth={0.5}
          strokeLinejoin="round"
        />
        {/* Crown gems */}
        <circle cx={crownW * 0.5} cy={crownH * 0.45} r={sw * 0.35} fill="#FF6B6B" />
        <circle cx={crownW * 0.25} cy={crownH * 0.55} r={sw * 0.25} fill="#4ECDC4" />
        <circle cx={crownW * 0.75} cy={crownH * 0.55} r={sw * 0.25} fill="#A78BFA" />
      </g>
    </>
  );
}

function RainbowFrame({ cx, cy, r, sw }: { cx: number; cy: number; r: number; sw: number }) {
  const gradientId = `rainbow-${cx}-${cy}`;
  return (
    <>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B6B" />
          <stop offset="20%" stopColor="#FFE66D" />
          <stop offset="40%" stopColor="#6BCB77" />
          <stop offset="60%" stopColor="#4ECDC4" />
          <stop offset="80%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#FF6B6B" />
        </linearGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={`url(#${gradientId})`} strokeWidth={sw} />
    </>
  );
}

function SparkleFrame({ cx, cy, r, sw, color }: { cx: number; cy: number; r: number; sw: number; color: string }) {
  // Ring + 4 sparkle dots at N/S/E/W
  const sparkleR = sw * 0.7;
  const positions = [
    { x: cx, y: cy - r },        // N
    { x: cx + r, y: cy },        // E
    { x: cx, y: cy + r },        // S
    { x: cx - r, y: cy },        // W
  ];

  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={sw} />
      {positions.map((pos, i) => (
        <motion.circle
          key={i}
          cx={pos.x}
          cy={pos.y}
          r={sparkleR}
          fill="#FFD93D"
          animate={{ opacity: [0.4, 1, 0.4], r: [sparkleR * 0.7, sparkleR, sparkleR * 0.7] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.35,
          }}
        />
      ))}
    </>
  );
}

function NatureFrame({ cx, cy, r, sw, color }: { cx: number; cy: number; r: number; sw: number; color: string }) {
  // Ring + 6 tiny leaf SVG elements
  const leafPositions: { x: number; y: number; rot: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60 - 90) * (Math.PI / 180);
    leafPositions.push({
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      rot: i * 60,
    });
  }
  const leafSize = sw * 1.5;

  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={sw} />
      {leafPositions.map((pos, i) => (
        <g key={i} transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.rot})`}>
          <ellipse cx={0} cy={0} rx={leafSize} ry={leafSize * 0.45} fill="#6BCB77" opacity={0.85} />
          <line x1={-leafSize * 0.6} y1={0} x2={leafSize * 0.6} y2={0} stroke="#6BCB77" strokeWidth={0.4} />
        </g>
      ))}
    </>
  );
}

/* ── Main Component ─────────────────────────────────── */

export default function AvatarFrame({
  emoji,
  photo,
  color,
  accentColor,
  size = 'lg',
  frameType = 'basic',
  badge,
  animated = false,
  spotlight,
  glowing,
  className = '',
}: AvatarFrameProps) {
  const resolvedColor = color ?? accentColor ?? '#FF6B6B';
  const resolvedSpotlight = spotlight ?? glowing ?? false;

  const cfg = sizeConfig[size];
  const radius = cfg.outer / 2;
  const frameR = radius - cfg.strokeWidth / 2 - 1;

  const frameRenderers: Record<AvatarFrameType, React.ReactNode> = {
    basic: <BasicFrame cx={radius} cy={radius} r={frameR} sw={cfg.strokeWidth} color={resolvedColor} />,
    star: <StarFrame cx={radius} cy={radius} r={frameR} sw={cfg.strokeWidth} color={resolvedColor} />,
    crown: <CrownFrame cx={radius} cy={radius} r={frameR} sw={cfg.strokeWidth} color={resolvedColor} />,
    rainbow: <RainbowFrame cx={radius} cy={radius} r={frameR} sw={cfg.strokeWidth} />,
    sparkle: <SparkleFrame cx={radius} cy={radius} r={frameR} sw={cfg.strokeWidth} color={resolvedColor} />,
    nature: <NatureFrame cx={radius} cy={radius} r={frameR} sw={cfg.strokeWidth} color={resolvedColor} />,
  };

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: cfg.outer, height: cfg.outer }}
      animate={animated ? { scale: [1, 1.02, 1] } : undefined}
      transition={animated ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : undefined}
    >
      {/* Spotlight glow behind */}
      {resolvedSpotlight && (
        <motion.div
          className="absolute inset-[-6px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${resolvedColor}20 0%, transparent 70%)`,
          }}
          animate={{ opacity: [0.5, 0.8, 0.5], scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* SVG frame */}
      <svg
        width={cfg.outer}
        height={cfg.outer}
        viewBox={`0 0 ${cfg.outer} ${cfg.outer}`}
        className="absolute inset-0"
        style={{ overflow: 'visible' }}
      >
        {frameRenderers[frameType]}
      </svg>

      {/* Background fill */}
      <div
        className="absolute rounded-full"
        style={{
          inset: cfg.strokeWidth + 3,
          backgroundColor: `${resolvedColor}12`,
        }}
      />

      {/* Avatar content: photo or emoji */}
      {photo ? (
        <img
          src={photo}
          alt="Avatar"
          className="relative z-10 rounded-full object-cover"
          style={{
            width: cfg.outer - cfg.strokeWidth * 2 - 6,
            height: cfg.outer - cfg.strokeWidth * 2 - 6,
          }}
          draggable={false}
        />
      ) : (
        <span
          className="relative z-10 select-none"
          style={{ fontSize: cfg.fontSize, lineHeight: 1 }}
        >
          {emoji}
        </span>
      )}

      {/* Badge overlay (bottom-right) */}
      {badge && (
        <motion.div
          className="absolute z-20 rounded-full flex items-center justify-center shadow-sm"
          style={{
            width: cfg.badgeSize,
            height: cfg.badgeSize,
            bottom: -2,
            right: -2,
            backgroundColor: resolvedColor,
            fontSize: cfg.badgeFont,
            lineHeight: 1,
          }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.3 }}
        >
          <span className="select-none">{badge}</span>
        </motion.div>
      )}
    </motion.div>
  );
}
