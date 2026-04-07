import { motion } from 'framer-motion';

interface DecorativeDotsProps {
  color?: string;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = { sm: 4, md: 6, lg: 10 };

// Deterministic pseudo-random based on index
function seeded(index: number, offset: number): number {
  const x = Math.sin(index * 127.1 + offset * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export default function DecorativeDots({
  color = '#FF6B6B',
  count = 5,
  size = 'md',
  className = '',
}: DecorativeDotsProps) {
  const r = sizeMap[size];

  const dots = Array.from({ length: count }, (_, i) => ({
    id: i,
    cx: seeded(i, 0) * 100,
    cy: seeded(i, 1) * 100,
    opacity: 0.04 + seeded(i, 2) * 0.04,
    delay: seeded(i, 3) * 2,
    floatDistance: 4 + seeded(i, 4) * 8,
  }));

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {dots.map((dot) => (
        <motion.svg
          key={dot.id}
          width={r * 2}
          height={r * 2}
          viewBox={`0 0 ${r * 2} ${r * 2}`}
          style={{
            position: 'absolute',
            left: `${dot.cx}%`,
            top: `${dot.cy}%`,
          }}
          initial={{ y: 0, opacity: 0 }}
          animate={{
            y: [0, -dot.floatDistance, 0],
            opacity: dot.opacity,
          }}
          transition={{
            y: {
              duration: 3 + dot.delay,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: dot.delay,
            },
            opacity: {
              duration: 0.8,
              delay: dot.delay * 0.3,
            },
          }}
        >
          <circle cx={r} cy={r} r={r} fill={color} />
        </motion.svg>
      ))}
    </div>
  );
}
