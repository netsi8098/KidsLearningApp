/**
 * ThemeScene — renders the full homepage world scene for a given theme.
 * Each theme gets a rich layered environment with ambient motion.
 */
import { motion } from 'framer-motion';
import type { HomepageTheme } from '../../data/homepageThemes';

interface ThemeSceneProps {
  theme: HomepageTheme;
}

/** Sunny Rainbow Meadow — bright, cheerful, full of life */
function SunnyMeadowScene() {
  return (
    <>
      {/* ── Sky background ── */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #7EC8E3 0%, #B8E4F0 40%, #D4F1F9 70%, #E8F5E9 100%)' }} />

      {/* ── Sun with glow ── */}
      <motion.div
        className="absolute pointer-events-none"
        style={{ top: '3%', right: '8%' }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="90" height="90" viewBox="0 0 90 90">
          <defs>
            <radialGradient id="ts-sun-glow" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#FFE66D" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FFE66D" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="ts-sun" cx="0.45" cy="0.4" r="0.5">
              <stop offset="0%" stopColor="#FFF8DC" />
              <stop offset="50%" stopColor="#FFE66D" />
              <stop offset="100%" stopColor="#FFD93D" />
            </radialGradient>
          </defs>
          <circle cx="45" cy="45" r="44" fill="url(#ts-sun-glow)" />
          <circle cx="45" cy="45" r="28" fill="url(#ts-sun)" />
          {/* Sun face */}
          <circle cx="38" cy="42" r="2.5" fill="#E6A817" />
          <circle cx="52" cy="42" r="2.5" fill="#E6A817" />
          <path d="M38 50Q45 56 52 50" stroke="#E6A817" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* Rays */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a) => (
            <motion.line
              key={a}
              x1={45 + 26 * Math.cos(a * Math.PI / 180)} y1={45 + 26 * Math.sin(a * Math.PI / 180)}
              x2={45 + 36 * Math.cos(a * Math.PI / 180)} y2={45 + 36 * Math.sin(a * Math.PI / 180)}
              stroke="#FFE66D" strokeWidth="2.5" strokeLinecap="round"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: (a / 360) * 2 }}
            />
          ))}
        </svg>
      </motion.div>

      {/* ── Clouds ── */}
      <motion.div
        className="absolute pointer-events-none"
        style={{ top: '6%', left: '5%' }}
        animate={{ x: [0, 15, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="120" height="50" viewBox="0 0 120 50">
          <ellipse cx="60" cy="28" rx="50" ry="20" fill="white" opacity="0.85" />
          <ellipse cx="40" cy="32" rx="30" ry="14" fill="white" opacity="0.75" />
          <ellipse cx="80" cy="32" rx="30" ry="14" fill="white" opacity="0.75" />
        </svg>
      </motion.div>
      <motion.div
        className="absolute pointer-events-none"
        style={{ top: '14%', right: '25%' }}
        animate={{ x: [0, -10, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="80" height="36" viewBox="0 0 80 36">
          <ellipse cx="40" cy="20" rx="35" ry="14" fill="white" opacity="0.7" />
          <ellipse cx="25" cy="22" rx="22" ry="10" fill="white" opacity="0.6" />
          <ellipse cx="55" cy="22" rx="22" ry="10" fill="white" opacity="0.6" />
        </svg>
      </motion.div>

      {/* ── Rainbow arc ── */}
      <div className="absolute pointer-events-none" style={{ top: '18%', left: '50%', transform: 'translateX(-50%)' }}>
        <motion.svg width="300" height="100" viewBox="0 0 300 100" animate={{ opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
          {[
            { r: 95, c: '#FF6B6B' }, { r: 88, c: '#FF8C42' }, { r: 81, c: '#FFE66D' },
            { r: 74, c: '#6BCB77' }, { r: 67, c: '#45B7D1' }, { r: 60, c: '#A78BFA' },
          ].map(({ r, c }) => (
            <path key={c} d={`M${150 - r} 95 A${r} ${r} 0 0 1 ${150 + r} 95`} stroke={c} strokeWidth="5" fill="none" opacity="0.6" />
          ))}
        </motion.svg>
      </div>

      {/* ── Rolling hills background ── */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMax slice" className="w-full" style={{ height: '35vh', minHeight: '180px' }}>
          <defs>
            <linearGradient id="ts-hill-far" x1="200" y1="0" x2="200" y2="160" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#A8E6CF" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#6BCB77" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="ts-hill-mid" x1="200" y1="30" x2="200" y2="160" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8FE388" />
              <stop offset="100%" stopColor="#57C86D" />
            </linearGradient>
            <linearGradient id="ts-hill-near" x1="200" y1="60" x2="200" y2="160" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#6BCB77" />
              <stop offset="100%" stopColor="#3A9E4A" />
            </linearGradient>
          </defs>
          {/* Far hill */}
          <path d="M-20 70C80 40 160 60 240 45C320 60 380 40 420 70V160H-20Z" fill="url(#ts-hill-far)" />
          {/* Mid hill */}
          <path d="M-20 90C60 65 140 80 220 68C300 80 360 65 420 90V160H-20Z" fill="url(#ts-hill-mid)" />
          {/* Near hill */}
          <path d="M-20 110C50 88 130 100 210 90C290 100 360 88 420 110V160H-20Z" fill="url(#ts-hill-near)" />

          {/* Flowers on hills */}
          {[[50, 95], [120, 85], [200, 78], [280, 85], [350, 92]].map(([x, y], i) => (
            <motion.g key={i} animate={{ y: [0, -2, 0] }} transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}>
              <rect x={x - 1} y={y} width="2" height="8" rx="1" fill="#4CAF50" />
              <circle cx={x} cy={y - 3} r={3 + (i % 2)} fill={['#FF8FAB', '#FFE66D', '#A78BFA', '#FF6B6B', '#4ECDC4'][i]} />
              <circle cx={x} cy={y - 3} r={1.5 + (i % 2) * 0.5} fill="#FFE66D" opacity="0.7" />
            </motion.g>
          ))}

          {/* Grass tufts */}
          {[[30, 105], [100, 92], [170, 84], [250, 88], [330, 100], [380, 106]].map(([x, y], i) => (
            <motion.g key={`g${i}`} animate={{ rotate: [-3, 3, -3] }} transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }} style={{ transformOrigin: `${x}px ${y}px` }}>
              <path d={`M${x - 2} ${y}L${x - 3} ${y - 10}L${x} ${y}`} stroke="#4CAF50" strokeWidth="1.5" fill="none" />
              <path d={`M${x + 1} ${y}L${x + 2} ${y - 12}L${x + 4} ${y}`} stroke="#6BCB77" strokeWidth="1.5" fill="none" />
            </motion.g>
          ))}

          {/* Mushrooms */}
          <rect x="155" y="82" width="3" height="6" rx="1.5" fill="#DEB887" />
          <ellipse cx="156.5" cy="82" rx="6" ry="4" fill="#FF6B6B" />
          <circle cx="154" cy="81" r="1.2" fill="white" opacity="0.6" />
          <circle cx="159" cy="81.5" r="0.8" fill="white" opacity="0.5" />

          <rect x="310" y="96" width="2.5" height="5" rx="1.2" fill="#DEB887" />
          <ellipse cx="311" cy="96" rx="5" ry="3.5" fill="#A78BFA" />
          <circle cx="309" cy="95" r="1" fill="white" opacity="0.5" />
        </svg>
      </div>

      {/* ── Butterflies ── */}
      <motion.div
        className="absolute pointer-events-none"
        style={{ top: '30%', left: '12%' }}
        animate={{ x: [0, 30, 10, 40, 0], y: [0, -15, 5, -10, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      >
        <motion.svg width="28" height="24" viewBox="0 0 28 24" animate={{ rotate: [-5, 5, -5] }} transition={{ duration: 2, repeat: Infinity }}>
          <ellipse cx="14" cy="12" rx="1.5" ry="6" fill="#5D3A1A" />
          <motion.ellipse cx="6" cy="9" rx="7" ry="5" fill="#A78BFA" opacity="0.7" animate={{ scaleX: [1, 0.7, 1] }} transition={{ duration: 0.6, repeat: Infinity }} />
          <motion.ellipse cx="22" cy="9" rx="7" ry="5" fill="#FF8FAB" opacity="0.7" animate={{ scaleX: [1, 0.7, 1] }} transition={{ duration: 0.6, repeat: Infinity }} />
          <motion.ellipse cx="7" cy="15" rx="5" ry="4" fill="#8B5CF6" opacity="0.5" animate={{ scaleX: [1, 0.7, 1] }} transition={{ duration: 0.6, repeat: Infinity }} />
          <motion.ellipse cx="21" cy="15" rx="5" ry="4" fill="#FF6B6B" opacity="0.5" animate={{ scaleX: [1, 0.7, 1] }} transition={{ duration: 0.6, repeat: Infinity }} />
        </motion.svg>
      </motion.div>

      <motion.div
        className="absolute pointer-events-none"
        style={{ top: '25%', right: '15%' }}
        animate={{ x: [0, -20, -5, -30, 0], y: [0, -10, 8, -5, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      >
        <motion.svg width="22" height="18" viewBox="0 0 28 24" animate={{ rotate: [3, -3, 3] }} transition={{ duration: 1.8, repeat: Infinity }}>
          <ellipse cx="14" cy="12" rx="1.2" ry="5" fill="#5D3A1A" />
          <motion.ellipse cx="7" cy="9" rx="6" ry="4.5" fill="#FFE66D" opacity="0.7" animate={{ scaleX: [1, 0.6, 1] }} transition={{ duration: 0.5, repeat: Infinity }} />
          <motion.ellipse cx="21" cy="9" rx="6" ry="4.5" fill="#FF8C42" opacity="0.6" animate={{ scaleX: [1, 0.6, 1] }} transition={{ duration: 0.5, repeat: Infinity }} />
        </motion.svg>
      </motion.div>

      {/* ── Floating sparkles / pollen ── */}
      {[
        { top: '10%', left: '20%', delay: 0, size: 10, color: '#FFE66D' },
        { top: '22%', right: '10%', delay: 1.5, size: 8, color: '#A78BFA' },
        { top: '8%', left: '55%', delay: 0.8, size: 6, color: '#FF8FAB' },
        { top: '18%', left: '35%', delay: 2.2, size: 7, color: '#4ECDC4' },
        { top: '15%', right: '35%', delay: 3, size: 5, color: '#FFE66D' },
      ].map((s, i) => (
        <motion.div
          key={i}
          className="fixed pointer-events-none"
          style={{ top: s.top, left: s.left, right: (s as any).right }}
          animate={{ y: [0, -12, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 4 + i, repeat: Infinity, delay: s.delay }}
        >
          <svg width={s.size} height={s.size} viewBox="0 0 12 12">
            <path d="M6 0L7.2 4.8L12 6L7.2 7.2L6 12L4.8 7.2L0 6L4.8 4.8Z" fill={s.color} opacity="0.7" />
          </svg>
        </motion.div>
      ))}
    </>
  );
}

export default function ThemeScene({ theme }: ThemeSceneProps) {
  switch (theme.id) {
    case 'sunny-meadow':
      return <SunnyMeadowScene />;
    // Future themes will have their own scene components
    case 'sky-islands':
    case 'river-garden':
    case 'treehouse':
    default:
      return <SunnyMeadowScene />; // Fallback to meadow until other themes are built
  }
}
