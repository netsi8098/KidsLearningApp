import { motion } from 'framer-motion';

interface FloatingShapesProps {
  palette?: string[];
  count?: number;
  className?: string;
}

const defaultPalette = [
  '#FF6B6B', // coral
  '#4ECDC4', // teal
  '#FFE66D', // sunny
  '#A78BFA', // grape
  '#6BCB77', // leaf
  '#FF8C42', // tangerine
];

// Deterministic pseudo-random based on index
function seeded(index: number, offset: number): number {
  const x = Math.sin(index * 127.1 + offset * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

type ShapeType = 'circle' | 'rounded-rect' | 'star';

function renderShape(type: ShapeType, shapeSize: number, fill: string) {
  switch (type) {
    case 'circle':
      return (
        <circle cx={shapeSize / 2} cy={shapeSize / 2} r={shapeSize / 2} fill={fill} />
      );
    case 'rounded-rect':
      return (
        <rect
          x={0}
          y={0}
          width={shapeSize}
          height={shapeSize}
          rx={shapeSize * 0.25}
          fill={fill}
        />
      );
    case 'star': {
      const cx = shapeSize / 2;
      const cy = shapeSize / 2;
      const outerR = shapeSize / 2;
      const innerR = shapeSize / 4.5;
      const points: string[] = [];
      for (let j = 0; j < 5; j++) {
        const outerAngle = (j * 72 - 90) * (Math.PI / 180);
        const innerAngle = ((j * 72 + 36) - 90) * (Math.PI / 180);
        points.push(`${cx + outerR * Math.cos(outerAngle)},${cy + outerR * Math.sin(outerAngle)}`);
        points.push(`${cx + innerR * Math.cos(innerAngle)},${cy + innerR * Math.sin(innerAngle)}`);
      }
      return <polygon points={points.join(' ')} fill={fill} />;
    }
  }
}

export default function FloatingShapes({
  palette,
  count = 6,
  className = '',
}: FloatingShapesProps) {
  const colors = palette ?? defaultPalette;
  const shapeTypes: ShapeType[] = ['circle', 'rounded-rect', 'star'];

  const shapes = Array.from({ length: count }, (_, i) => {
    const shapeSize = 20 + seeded(i, 0) * 40;
    const type = shapeTypes[Math.floor(seeded(i, 1) * shapeTypes.length)];
    const fill = colors[Math.floor(seeded(i, 2) * colors.length)];
    const left = seeded(i, 3) * 100;
    const top = seeded(i, 4) * 100;
    const opacity = 0.06 + seeded(i, 5) * 0.06;
    const floatDistance = 8 + seeded(i, 6) * 16;
    const duration = 5 + seeded(i, 7) * 6;
    const delay = seeded(i, 8) * 3;
    const rotateAmount = 15 + seeded(i, 9) * 30;

    return {
      id: i,
      shapeSize,
      type,
      fill,
      left,
      top,
      opacity,
      floatDistance,
      duration,
      delay,
      rotateAmount,
    };
  });

  return (
    <div
      className={`pointer-events-none relative w-full overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {shapes.map((s) => (
        <motion.svg
          key={s.id}
          width={s.shapeSize}
          height={s.shapeSize}
          viewBox={`0 0 ${s.shapeSize} ${s.shapeSize}`}
          style={{
            position: 'absolute',
            left: `${s.left}%`,
            top: `${s.top}%`,
            opacity: s.opacity,
          }}
          initial={{ y: 0, rotate: 0 }}
          animate={{
            y: [0, -s.floatDistance, 0],
            rotate: [0, s.rotateAmount, 0],
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: s.delay,
          }}
        >
          {renderShape(s.type, s.shapeSize, s.fill)}
        </motion.svg>
      ))}
    </div>
  );
}
