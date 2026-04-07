import { motion } from 'framer-motion';

interface IllustrationSceneProps {
  scene: 'hills' | 'clouds' | 'stars' | 'underwater' | 'space' | 'garden';
  height?: number;
  className?: string;
}

function HillsScene() {
  return (
    <>
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#74B9FF" stopOpacity={0.2} />
          <stop offset="100%" stopColor="#FFF8F0" stopOpacity={0.05} />
        </linearGradient>
      </defs>
      <rect width="1440" height="120" fill="url(#skyGrad)" />
      {/* Far hills */}
      <motion.g
        animate={{ x: [0, 5, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ellipse cx={300} cy={120} rx={350} ry={60} fill="#6BCB77" opacity={0.12} />
        <ellipse cx={900} cy={120} rx={400} ry={50} fill="#6BCB77" opacity={0.1} />
        <ellipse cx={1300} cy={120} rx={300} ry={55} fill="#6BCB77" opacity={0.08} />
      </motion.g>
      {/* Near hills */}
      <motion.g
        animate={{ x: [0, -3, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ellipse cx={200} cy={120} rx={280} ry={45} fill="#6BCB77" opacity={0.18} />
        <ellipse cx={720} cy={120} rx={320} ry={40} fill="#4ECDC4" opacity={0.1} />
        <ellipse cx={1100} cy={120} rx={260} ry={50} fill="#6BCB77" opacity={0.15} />
      </motion.g>
      {/* Tiny trees */}
      {[180, 400, 650, 980, 1250].map((x, i) => (
        <g key={i}>
          <rect x={x - 2} y={88} width={4} height={12} rx={1} fill="#6BCB77" opacity={0.2} />
          <circle cx={x} cy={84} r={7} fill="#6BCB77" opacity={0.15} />
        </g>
      ))}
    </>
  );
}

function CloudsScene() {
  const clouds = [
    { cx: 150, cy: 40, rx: 80, ry: 25, delay: 0 },
    { cx: 500, cy: 25, rx: 100, ry: 30, delay: 1.5 },
    { cx: 850, cy: 50, rx: 70, ry: 22, delay: 0.8 },
    { cx: 1150, cy: 30, rx: 90, ry: 28, delay: 2 },
    { cx: 1400, cy: 55, rx: 60, ry: 20, delay: 0.3 },
  ];

  return (
    <>
      <rect width="1440" height="120" fill="#FFF8F0" opacity={0.3} />
      {clouds.map((c, i) => (
        <motion.g
          key={i}
          animate={{ x: [0, 15, 0] }}
          transition={{ duration: 8 + c.delay * 2, repeat: Infinity, ease: 'easeInOut', delay: c.delay }}
        >
          <ellipse cx={c.cx} cy={c.cy} rx={c.rx} ry={c.ry} fill="white" opacity={0.5} />
          <ellipse cx={c.cx - c.rx * 0.4} cy={c.cy - c.ry * 0.3} rx={c.rx * 0.5} ry={c.ry * 0.7} fill="white" opacity={0.4} />
          <ellipse cx={c.cx + c.rx * 0.35} cy={c.cy - c.ry * 0.2} rx={c.rx * 0.45} ry={c.ry * 0.6} fill="white" opacity={0.4} />
        </motion.g>
      ))}
    </>
  );
}

function StarsScene() {
  const stars = [
    { x: 100, y: 30, r: 2 }, { x: 250, y: 60, r: 1.5 }, { x: 400, y: 20, r: 2.5 },
    { x: 550, y: 80, r: 1.5 }, { x: 700, y: 40, r: 2 }, { x: 850, y: 15, r: 1.8 },
    { x: 1000, y: 70, r: 2.2 }, { x: 1150, y: 35, r: 1.5 }, { x: 1300, y: 55, r: 2 },
    { x: 180, y: 90, r: 1.2 }, { x: 600, y: 100, r: 1 }, { x: 1050, y: 95, r: 1.5 },
  ];

  return (
    <>
      <defs>
        <linearGradient id="nightGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2D2D3A" stopOpacity={0.15} />
          <stop offset="100%" stopColor="#A78BFA" stopOpacity={0.08} />
        </linearGradient>
      </defs>
      <rect width="1440" height="120" fill="url(#nightGrad)" />
      {/* Moon */}
      <motion.g
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <circle cx={1200} cy={35} r={22} fill="#FFE66D" opacity={0.4} />
        <circle cx={1208} cy={30} r={18} fill="#FFD93D" opacity={0.15} />
      </motion.g>
      {/* Stars twinkling */}
      {stars.map((s, i) => (
        <motion.circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="#FFE66D"
          initial={{ opacity: 0.15 }}
          animate={{ opacity: [0.15, 0.5, 0.15] }}
          transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.25 }}
        />
      ))}
    </>
  );
}

function UnderwaterScene() {
  const bubbles = [
    { cx: 200, cy: 90, r: 5, delay: 0 }, { cx: 450, cy: 80, r: 3, delay: 1 },
    { cx: 700, cy: 95, r: 4, delay: 0.5 }, { cx: 950, cy: 85, r: 6, delay: 1.8 },
    { cx: 1200, cy: 92, r: 3.5, delay: 0.3 }, { cx: 350, cy: 70, r: 2.5, delay: 2.2 },
    { cx: 1050, cy: 75, r: 4.5, delay: 1.2 },
  ];

  return (
    <>
      <defs>
        <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#74B9FF" stopOpacity={0.15} />
          <stop offset="100%" stopColor="#4ECDC4" stopOpacity={0.12} />
        </linearGradient>
      </defs>
      <rect width="1440" height="120" fill="url(#waterGrad)" />
      {/* Seaweed */}
      {[120, 380, 640, 900, 1180, 1350].map((x, i) => (
        <motion.path
          key={i}
          d={`M${x},120 C${x + 8},${100 - i * 2} ${x - 8},${80 - i * 3} ${x + 4},${60 + i * 2}`}
          fill="none"
          stroke="#6BCB77"
          strokeWidth={3}
          strokeLinecap="round"
          opacity={0.15}
          animate={{ d: [
            `M${x},120 C${x + 8},${100 - i * 2} ${x - 8},${80 - i * 3} ${x + 4},${60 + i * 2}`,
            `M${x},120 C${x - 6},${100 - i * 2} ${x + 10},${80 - i * 3} ${x - 2},${60 + i * 2}`,
            `M${x},120 C${x + 8},${100 - i * 2} ${x - 8},${80 - i * 3} ${x + 4},${60 + i * 2}`,
          ] }}
          transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      {/* Bubbles */}
      {bubbles.map((b, i) => (
        <motion.circle
          key={i}
          cx={b.cx}
          cy={b.cy}
          r={b.r}
          fill="none"
          stroke="white"
          strokeWidth={1}
          opacity={0.3}
          animate={{ cy: [b.cy, b.cy - 40], opacity: [0.3, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: b.delay, ease: 'easeOut' }}
        />
      ))}
    </>
  );
}

function SpaceScene() {
  const stars = Array.from({ length: 20 }, (_, i) => ({
    x: (i * 73 + 50) % 1440,
    y: (i * 47 + 10) % 110,
    r: 1 + (i % 3) * 0.5,
  }));

  return (
    <>
      <defs>
        <linearGradient id="spaceGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2D2D3A" stopOpacity={0.12} />
          <stop offset="100%" stopColor="#A78BFA" stopOpacity={0.06} />
        </linearGradient>
      </defs>
      <rect width="1440" height="120" fill="url(#spaceGrad)" />
      {/* Stars */}
      {stars.map((s, i) => (
        <motion.circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="white"
          initial={{ opacity: 0.1 }}
          animate={{ opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
      {/* Planet */}
      <motion.g
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <circle cx={350} cy={50} r={18} fill="#FF8C42" opacity={0.2} />
        <ellipse cx={350} cy={50} rx={28} ry={6} fill="#FFE66D" opacity={0.1} transform="rotate(-15 350 50)" />
      </motion.g>
      {/* Rocket silhouette */}
      <motion.g
        animate={{ x: [0, 10, 0], y: [0, -3, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path
          d="M1050,60 L1040,75 L1045,75 L1045,85 L1055,85 L1055,75 L1060,75 Z"
          fill="#4ECDC4"
          opacity={0.2}
        />
        <ellipse cx={1050} cy={88} rx={4} ry={3} fill="#FF8C42" opacity={0.15} />
      </motion.g>
    </>
  );
}

function GardenScene() {
  const flowers = [
    { x: 100, color: '#FF6B6B' }, { x: 320, color: '#FFE66D' },
    { x: 550, color: '#A78BFA' }, { x: 780, color: '#FD79A8' },
    { x: 1000, color: '#FF8C42' }, { x: 1230, color: '#FF6B6B' },
    { x: 1380, color: '#FFE66D' },
  ];

  return (
    <>
      <rect width="1440" height="120" fill="#FFF8F0" opacity={0.2} />
      {/* Grass */}
      <rect x={0} y={95} width={1440} height={25} rx={0} fill="#6BCB77" opacity={0.12} />
      <motion.g
        animate={{ x: [0, 3, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Grass tufts */}
        {[50, 200, 380, 500, 680, 820, 1000, 1150, 1320].map((x, i) => (
          <path
            key={`grass-${i}`}
            d={`M${x},95 L${x - 4},${78 + i % 3 * 4} M${x},95 L${x + 3},${75 + i % 4 * 3} M${x},95 L${x + 7},${80 + i % 2 * 5}`}
            fill="none"
            stroke="#6BCB77"
            strokeWidth={1.5}
            strokeLinecap="round"
            opacity={0.18}
          />
        ))}
      </motion.g>
      {/* Flowers */}
      {flowers.map((f, i) => (
        <motion.g
          key={i}
          animate={{ rotate: [-2, 2, -2] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: `${f.x}px 95px` }}
        >
          <line x1={f.x} y1={95} x2={f.x} y2={68 + (i % 3) * 5} stroke="#6BCB77" strokeWidth={2} opacity={0.2} />
          <circle cx={f.x} cy={65 + (i % 3) * 5} r={6} fill={f.color} opacity={0.2} />
          <circle cx={f.x} cy={65 + (i % 3) * 5} r={2.5} fill="#FFE66D" opacity={0.25} />
        </motion.g>
      ))}
      {/* Butterflies */}
      {[{ x: 280, y: 45 }, { x: 900, y: 35 }].map((b, i) => (
        <motion.g
          key={`butterfly-${i}`}
          animate={{ x: [0, 20, 0], y: [0, -8, 0] }}
          transition={{ duration: 5 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i }}
        >
          <ellipse cx={b.x - 5} cy={b.y} rx={5} ry={3.5} fill="#A78BFA" opacity={0.2} transform={`rotate(-20 ${b.x - 5} ${b.y})`} />
          <ellipse cx={b.x + 5} cy={b.y} rx={5} ry={3.5} fill="#A78BFA" opacity={0.2} transform={`rotate(20 ${b.x + 5} ${b.y})`} />
          <circle cx={b.x} cy={b.y} r={1} fill="#A78BFA" opacity={0.25} />
        </motion.g>
      ))}
    </>
  );
}

export default function IllustrationScene({
  scene,
  height = 120,
  className = '',
}: IllustrationSceneProps) {
  const sceneMap = {
    hills: HillsScene,
    clouds: CloudsScene,
    stars: StarsScene,
    underwater: UnderwaterScene,
    space: SpaceScene,
    garden: GardenScene,
  };

  const SceneComponent = sceneMap[scene];

  return (
    <div
      className={`pointer-events-none w-full overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height={height}
        viewBox="0 0 1440 120"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <SceneComponent />
      </svg>
    </div>
  );
}
