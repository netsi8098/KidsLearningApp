import { motion } from 'framer-motion';

interface RewardStickerProps {
  type: 'star' | 'trophy' | 'medal' | 'crown' | 'heart' | 'rocket' | 'rainbow' | 'lightning';
  size?: number;
  animated?: boolean;
  className?: string;
}

const entranceVariants = {
  hidden: { scale: 0, rotate: -20 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: { type: 'spring', stiffness: 400, damping: 12 },
  },
};

const floatTransition = {
  y: {
    duration: 2.5,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  },
};

function StickerSVG({ type, size }: { type: RewardStickerProps['type']; size: number }) {
  const vb = `0 0 ${size} ${size}`;
  const s = size;

  switch (type) {
    // Gold 5-point star with inner highlight
    case 'star': {
      const cx = s / 2;
      const cy = s / 2;
      const outer = s * 0.45;
      const inner = s * 0.18;
      const pts: string[] = [];
      for (let i = 0; i < 5; i++) {
        const oa = (i * 72 - 90) * (Math.PI / 180);
        const ia = ((i * 72 + 36) - 90) * (Math.PI / 180);
        pts.push(`${cx + outer * Math.cos(oa)},${cy + outer * Math.sin(oa)}`);
        pts.push(`${cx + inner * Math.cos(ia)},${cy + inner * Math.sin(ia)}`);
      }
      return (
        <svg width={s} height={s} viewBox={vb}>
          <polygon points={pts.join(' ')} fill="#FFD93D" />
          <polygon points={pts.join(' ')} fill="url(#starHighlight)" />
          <defs>
            <radialGradient id="starHighlight" cx="40%" cy="35%" r="50%">
              <stop offset="0%" stopColor="white" stopOpacity={0.5} />
              <stop offset="100%" stopColor="white" stopOpacity={0} />
            </radialGradient>
          </defs>
        </svg>
      );
    }

    // Gold trophy cup with handles
    case 'trophy':
      return (
        <svg width={s} height={s} viewBox={vb}>
          <rect x={s * 0.3} y={s * 0.15} width={s * 0.4} height={s * 0.4} rx={s * 0.04} fill="#FFD93D" />
          <rect x={s * 0.35} y={s * 0.2} width={s * 0.3} height={s * 0.2} rx={s * 0.03} fill="#FFF8F0" opacity={0.4} />
          <path
            d={`M${s * 0.3},${s * 0.25} C${s * 0.15},${s * 0.25} ${s * 0.12},${s * 0.45} ${s * 0.28},${s * 0.45}`}
            fill="none" stroke="#FFD93D" strokeWidth={s * 0.05} strokeLinecap="round"
          />
          <path
            d={`M${s * 0.7},${s * 0.25} C${s * 0.85},${s * 0.25} ${s * 0.88},${s * 0.45} ${s * 0.72},${s * 0.45}`}
            fill="none" stroke="#FFD93D" strokeWidth={s * 0.05} strokeLinecap="round"
          />
          <rect x={s * 0.4} y={s * 0.55} width={s * 0.2} height={s * 0.15} rx={s * 0.02} fill="#FF8C42" />
          <rect x={s * 0.28} y={s * 0.7} width={s * 0.44} height={s * 0.1} rx={s * 0.03} fill="#FFD93D" />
        </svg>
      );

    // Circular medal with ribbon in coral
    case 'medal':
      return (
        <svg width={s} height={s} viewBox={vb}>
          <polygon
            points={`${s * 0.35},${s * 0.05} ${s * 0.25},${s * 0.45} ${s * 0.45},${s * 0.35}`}
            fill="#FF6B6B"
          />
          <polygon
            points={`${s * 0.65},${s * 0.05} ${s * 0.75},${s * 0.45} ${s * 0.55},${s * 0.35}`}
            fill="#FF6B6B"
          />
          <circle cx={s / 2} cy={s * 0.55} r={s * 0.28} fill="#FFD93D" />
          <circle cx={s / 2} cy={s * 0.55} r={s * 0.2} fill="#FFF8F0" opacity={0.4} />
          <text
            x={s / 2}
            y={s * 0.6}
            textAnchor="middle"
            fontFamily="system-ui"
            fontWeight={800}
            fontSize={s * 0.22}
            fill="#FF8C42"
          >
            1
          </text>
        </svg>
      );

    // Golden crown with gems
    case 'crown':
      return (
        <svg width={s} height={s} viewBox={vb}>
          <path
            d={`M${s * 0.1},${s * 0.65} L${s * 0.2},${s * 0.3} L${s * 0.35},${s * 0.5} L${s * 0.5},${s * 0.2} L${s * 0.65},${s * 0.5} L${s * 0.8},${s * 0.3} L${s * 0.9},${s * 0.65} Z`}
            fill="#FFD93D"
          />
          <rect x={s * 0.1} y={s * 0.65} width={s * 0.8} height={s * 0.12} rx={s * 0.03} fill="#FF8C42" />
          <circle cx={s * 0.35} cy={s * 0.55} r={s * 0.045} fill="#4ECDC4" />
          <circle cx={s * 0.5} cy={s * 0.5} r={s * 0.045} fill="#FF6B6B" />
          <circle cx={s * 0.65} cy={s * 0.55} r={s * 0.045} fill="#A78BFA" />
        </svg>
      );

    // Gradient heart
    case 'heart':
      return (
        <svg width={s} height={s} viewBox={vb}>
          <defs>
            <linearGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B6B" />
              <stop offset="100%" stopColor="#FD79A8" />
            </linearGradient>
          </defs>
          <path
            d={`M${s / 2},${s * 0.85} C${s * 0.3},${s * 0.7} ${s * 0.05},${s * 0.5} ${s * 0.05},${s * 0.33} C${s * 0.05},${s * 0.15} ${s * 0.18},${s * 0.08} ${s * 0.32},${s * 0.08} C${s * 0.4},${s * 0.08} ${s * 0.46},${s * 0.13} ${s / 2},${s * 0.2} C${s * 0.54},${s * 0.13} ${s * 0.6},${s * 0.08} ${s * 0.68},${s * 0.08} C${s * 0.82},${s * 0.08} ${s * 0.95},${s * 0.15} ${s * 0.95},${s * 0.33} C${s * 0.95},${s * 0.5} ${s * 0.7},${s * 0.7} ${s / 2},${s * 0.85} Z`}
            fill="url(#heartGrad)"
          />
          <ellipse cx={s * 0.35} cy={s * 0.32} rx={s * 0.08} ry={s * 0.06} fill="white" opacity={0.4} transform={`rotate(-30 ${s * 0.35} ${s * 0.32})`} />
        </svg>
      );

    // Teal/coral rocket with flame
    case 'rocket':
      return (
        <svg width={s} height={s} viewBox={vb}>
          {/* Flame */}
          <ellipse cx={s / 2} cy={s * 0.88} rx={s * 0.1} ry={s * 0.1} fill="#FF8C42" />
          <ellipse cx={s / 2} cy={s * 0.84} rx={s * 0.06} ry={s * 0.08} fill="#FFE66D" />
          {/* Body */}
          <path
            d={`M${s / 2},${s * 0.08} C${s * 0.35},${s * 0.25} ${s * 0.32},${s * 0.55} ${s * 0.35},${s * 0.75} L${s * 0.65},${s * 0.75} C${s * 0.68},${s * 0.55} ${s * 0.65},${s * 0.25} ${s / 2},${s * 0.08} Z`}
            fill="#4ECDC4"
          />
          {/* Window */}
          <circle cx={s / 2} cy={s * 0.38} r={s * 0.08} fill="#FFF8F0" />
          <circle cx={s / 2} cy={s * 0.38} r={s * 0.05} fill="#74B9FF" />
          {/* Fins */}
          <path d={`M${s * 0.35},${s * 0.6} L${s * 0.2},${s * 0.78} L${s * 0.35},${s * 0.75} Z`} fill="#FF6B6B" />
          <path d={`M${s * 0.65},${s * 0.6} L${s * 0.8},${s * 0.78} L${s * 0.65},${s * 0.75} Z`} fill="#FF6B6B" />
        </svg>
      );

    // Colorful arch with clouds
    case 'rainbow': {
      const colors = ['#FF6B6B', '#FF8C42', '#FFE66D', '#6BCB77', '#74B9FF', '#A78BFA'];
      return (
        <svg width={s} height={s} viewBox={vb}>
          {colors.map((c, i) => (
            <path
              key={i}
              d={`M${s * 0.1},${s * 0.75} A${s * (0.4 - i * 0.04)},${s * (0.4 - i * 0.04)} 0 0 1 ${s * 0.9},${s * 0.75}`}
              fill="none"
              stroke={c}
              strokeWidth={s * 0.04}
              strokeLinecap="round"
            />
          ))}
          {/* Clouds */}
          <circle cx={s * 0.12} cy={s * 0.75} r={s * 0.08} fill="white" />
          <circle cx={s * 0.18} cy={s * 0.72} r={s * 0.06} fill="white" />
          <circle cx={s * 0.88} cy={s * 0.75} r={s * 0.08} fill="white" />
          <circle cx={s * 0.82} cy={s * 0.72} r={s * 0.06} fill="white" />
        </svg>
      );
    }

    // Gold lightning bolt with glow
    case 'lightning':
      return (
        <svg width={s} height={s} viewBox={vb}>
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation={s * 0.03} result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <polygon
            points={`${s * 0.55},${s * 0.05} ${s * 0.3},${s * 0.45} ${s * 0.48},${s * 0.45} ${s * 0.4},${s * 0.95} ${s * 0.7},${s * 0.5} ${s * 0.52},${s * 0.5} ${s * 0.55},${s * 0.05}`}
            fill="#FFD93D"
            filter="url(#glow)"
          />
          <polygon
            points={`${s * 0.53},${s * 0.15} ${s * 0.38},${s * 0.43} ${s * 0.48},${s * 0.43} ${s * 0.44},${s * 0.72} ${s * 0.6},${s * 0.52} ${s * 0.52},${s * 0.52} ${s * 0.53},${s * 0.15}`}
            fill="white"
            opacity={0.3}
          />
        </svg>
      );
  }
}

export default function RewardSticker({
  type,
  size = 64,
  animated = true,
  className = '',
}: RewardStickerProps) {
  if (!animated) {
    return (
      <div className={`inline-flex ${className}`}>
        <StickerSVG type={type} size={size} />
      </div>
    );
  }

  return (
    <motion.div
      className={`inline-flex ${className}`}
      variants={entranceVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={floatTransition}
      >
        <StickerSVG type={type} size={size} />
      </motion.div>
    </motion.div>
  );
}
