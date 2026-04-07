import { motion, AnimatePresence } from 'framer-motion';

interface SparkleEffectProps {
  active?: boolean;
  color?: string;
  count?: number;
  className?: string;
}

// Deterministic pseudo-random based on index
function seeded(index: number, offset: number): number {
  const x = Math.sin(index * 127.1 + offset * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

// 4-point star path centered at (cx, cy) with given radius
function starPath(cx: number, cy: number, r: number): string {
  const inner = r * 0.3;
  return [
    `M${cx},${cy - r}`,
    `L${cx + inner},${cy - inner}`,
    `L${cx + r},${cy}`,
    `L${cx + inner},${cy + inner}`,
    `L${cx},${cy + r}`,
    `L${cx - inner},${cy + inner}`,
    `L${cx - r},${cy}`,
    `L${cx - inner},${cy - inner}`,
    'Z',
  ].join(' ');
}

export default function SparkleEffect({
  active = true,
  color = '#FFD93D',
  count = 8,
  className = '',
}: SparkleEffectProps) {
  const sparkles = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: seeded(i, 0) * 100,
    top: seeded(i, 1) * 100,
    size: 6 + seeded(i, 2) * 8,
    delay: seeded(i, 3) * 1.5,
    duration: 0.6 + seeded(i, 4) * 0.6,
  }));

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <AnimatePresence>
        {active &&
          sparkles.map((s) => {
            const r = s.size / 2;
            const svgSize = s.size + 2;
            const center = svgSize / 2;
            return (
              <motion.svg
                key={s.id}
                width={svgSize}
                height={svgSize}
                viewBox={`0 0 ${svgSize} ${svgSize}`}
                style={{
                  position: 'absolute',
                  left: `${s.left}%`,
                  top: `${s.top}%`,
                }}
                initial={{ scale: 0, opacity: 0, rotate: 0 }}
                animate={{
                  scale: [0, 1.2, 0],
                  opacity: [0, 1, 0],
                  rotate: [0, 30, 60],
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  duration: s.duration,
                  repeat: Infinity,
                  repeatDelay: 0.8 + s.delay,
                  delay: s.delay,
                  ease: 'easeInOut',
                }}
              >
                <path d={starPath(center, center, r)} fill={color} />
              </motion.svg>
            );
          })}
      </AnimatePresence>
    </div>
  );
}
