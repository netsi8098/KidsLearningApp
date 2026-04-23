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

/** Sky Islands Adventure — magical floating islands in a dreamy night/twilight sky */
function SkyIslandsScene() {
  return (
    <>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #0F0A2E 0%, #1A1055 25%, #2D1B69 50%, #4A3080 75%, #6B4C9A 100%)' }} />

      {/* Stars */}
      {[[8,5,2],[15,12,1.5],[25,8,1],[35,15,2],[45,6,1.5],[55,18,1],[65,4,2],[75,14,1.5],[85,9,1],[92,16,2],[20,22,1],[70,20,1.5],[50,3,1],[40,20,1]].map(([x,y,r],i) => (
        <motion.div key={i} className="absolute pointer-events-none" style={{ left: `${x}%`, top: `${y}%` }}
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.4 }}
        >
          <svg width={r as number * 5} height={r as number * 5} viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="#FFE66D" /></svg>
        </motion.div>
      ))}

      {/* Moon */}
      <motion.div className="absolute pointer-events-none" style={{ top: '5%', left: '10%' }} animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 6, repeat: Infinity }}>
        <svg width="60" height="60" viewBox="0 0 60 60">
          <defs><radialGradient id="si-moon" cx="0.4" cy="0.4" r="0.6"><stop offset="0%" stopColor="#FFF8DC" /><stop offset="100%" stopColor="#F5E6C8" /></radialGradient></defs>
          <circle cx="30" cy="30" r="24" fill="url(#si-moon)" /><circle cx="30" cy="30" r="30" fill="#FFF8DC" opacity="0.06" />
          <circle cx="22" cy="24" r="4" fill="#F0E0B0" opacity="0.3" /><circle cx="34" cy="32" r="3" fill="#F0E0B0" opacity="0.25" />
        </svg>
      </motion.div>

      {/* Rainbow trail */}
      <motion.div className="absolute pointer-events-none" style={{ top: '25%', left: '50%', transform: 'translateX(-50%)' }}
        animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 5, repeat: Infinity }}>
        <svg width="280" height="60" viewBox="0 0 280 60">
          {[{r:55,c:'#FF6B6B'},{r:50,c:'#FF8C42'},{r:45,c:'#FFE66D'},{r:40,c:'#6BCB77'},{r:35,c:'#45B7D1'},{r:30,c:'#A78BFA'}].map(({r,c}) => (
            <path key={c} d={`M${140-r} 55 A${r} ${r} 0 0 1 ${140+r} 55`} stroke={c} strokeWidth="3" fill="none" opacity="0.5" />
          ))}
        </svg>
      </motion.div>

      {/* Floating islands */}
      <motion.div className="absolute pointer-events-none" style={{ bottom: '30%', left: '5%' }}
        animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
        <svg width="120" height="70" viewBox="0 0 120 70">
          <ellipse cx="60" cy="50" rx="55" ry="18" fill="#6BCB77" /><ellipse cx="60" cy="52" rx="50" ry="14" fill="#57C86D" />
          <path d="M30 50 Q35 55 60 58 Q85 55 90 50 Q85 65 60 68 Q35 65 30 50Z" fill="#4CAF50" opacity="0.5" />
          <rect x="40" y="28" width="6" height="22" rx="2" fill="#8B6914" /><ellipse cx="43" cy="22" rx="16" ry="14" fill="#4CAF50" />
          <ellipse cx="36" cy="25" rx="10" ry="10" fill="#66BB6A" opacity="0.7" /><ellipse cx="50" cy="24" rx="10" ry="10" fill="#43A047" opacity="0.7" />
          <circle cx="80" cy="40" r="4" fill="#FF8FAB" /><circle cx="80" cy="40" r="2" fill="#FFE66D" />
        </svg>
      </motion.div>

      <motion.div className="absolute pointer-events-none" style={{ bottom: '35%', right: '8%' }}
        animate={{ y: [0, -6, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}>
        <svg width="90" height="55" viewBox="0 0 90 55">
          <ellipse cx="45" cy="38" rx="42" ry="14" fill="#6BCB77" /><ellipse cx="45" cy="40" rx="38" ry="10" fill="#57C86D" />
          <circle cx="30" cy="28" r="4" fill="#A78BFA" /><circle cx="30" cy="28" r="2" fill="#FFE66D" />
          <circle cx="55" cy="30" r="3.5" fill="#FF6B6B" /><circle cx="55" cy="30" r="1.5" fill="#FFE66D" />
        </svg>
      </motion.div>

      {/* Rocket */}
      <motion.div className="absolute pointer-events-none" style={{ top: '15%', right: '12%' }}
        animate={{ y: [0, -10, 0], rotate: [-3, 3, -3] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
        <svg width="30" height="55" viewBox="0 0 30 55">
          <path d="M15 2Q8 12 7 22L7 38Q7 42 11 44L19 44Q23 42 23 38L23 22Q22 12 15 2Z" fill="#FF6B6B" stroke="#E55050" strokeWidth="0.5" />
          <circle cx="15" cy="22" r="5" fill="#45B7D1" /><circle cx="15" cy="22" r="3" fill="#87CEEB" />
          <path d="M7 30L2 40L7 36" fill="#FF8C42" /><path d="M23 30L28 40L23 36" fill="#FF8C42" />
          <path d="M11 44Q13 50 15 52Q17 50 19 44" fill="#FFE66D" />
          <rect x="10" y="32" width="10" height="4" rx="1" fill="#E55050" opacity="0.5" />
        </svg>
      </motion.div>

      {/* Cloud sea at bottom */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 400 100" preserveAspectRatio="xMidYMax slice" className="w-full" style={{ height: '22vh', minHeight: '100px' }}>
          <motion.g animate={{ x: [0, 10, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}>
            <ellipse cx="80" cy="50" rx="70" ry="25" fill="white" opacity="0.15" />
            <ellipse cx="200" cy="55" rx="80" ry="28" fill="white" opacity="0.12" />
            <ellipse cx="330" cy="48" rx="65" ry="22" fill="white" opacity="0.15" />
          </motion.g>
          <motion.g animate={{ x: [0, -8, 0] }} transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}>
            <ellipse cx="50" cy="70" rx="90" ry="30" fill="white" opacity="0.2" />
            <ellipse cx="180" cy="75" rx="100" ry="32" fill="white" opacity="0.18" />
            <ellipse cx="320" cy="68" rx="85" ry="28" fill="white" opacity="0.2" />
          </motion.g>
          <path d="M0 80C60 70 140 85 200 75C260 85 340 70 400 80V100H0Z" fill="white" opacity="0.25" />
          <path d="M0 90C50 82 120 92 200 85C280 92 350 82 400 90V100H0Z" fill="white" opacity="0.3" />
        </svg>
      </div>

      {/* Floating sparkles */}
      {[[12,30,'#FFE66D'],[80,20,'#A78BFA'],[30,40,'#FF8FAB'],[60,35,'#4ECDC4'],[90,25,'#FFE66D']].map(([x,y,c],i) => (
        <motion.div key={i} className="absolute pointer-events-none" style={{ left: `${x}%`, top: `${y}%` }}
          animate={{ y: [0, -10, 0], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 4+i, repeat: Infinity, delay: i*0.8 }}>
          <svg width="8" height="8" viewBox="0 0 12 12"><path d="M6 0L7.2 4.8L12 6L7.2 7.2L6 12L4.8 7.2L0 6L4.8 4.8Z" fill={c as string} /></svg>
        </motion.div>
      ))}
    </>
  );
}

/** River Garden — peaceful lush garden with sparkling stream */
function RiverGardenScene() {
  return (
    <>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #87CEEB 0%, #B0E0F0 35%, #C8E6C9 70%, #A8E6CF 100%)' }} />

      {/* Sun */}
      <motion.div className="absolute pointer-events-none" style={{ top: '3%', right: '10%' }}
        animate={{ scale: [1, 1.03, 1] }} transition={{ duration: 5, repeat: Infinity }}>
        <svg width="70" height="70" viewBox="0 0 70 70">
          <circle cx="35" cy="35" r="34" fill="#FFE66D" opacity="0.15" /><circle cx="35" cy="35" r="22" fill="#FFE66D" />
          <circle cx="35" cy="35" r="14" fill="#FFF8DC" opacity="0.4" />
        </svg>
      </motion.div>

      {/* Clouds */}
      <motion.div className="absolute pointer-events-none" style={{ top: '5%', left: '8%' }} animate={{ x: [0, 12, 0] }} transition={{ duration: 18, repeat: Infinity }}>
        <svg width="100" height="40" viewBox="0 0 100 40"><ellipse cx="50" cy="22" rx="42" ry="16" fill="white" opacity="0.8" /><ellipse cx="35" cy="25" rx="25" ry="12" fill="white" opacity="0.7" /><ellipse cx="65" cy="25" rx="25" ry="12" fill="white" opacity="0.7" /></svg>
      </motion.div>

      {/* Trees in background */}
      {[[10,40],[88,38]].map(([x,y],i) => (
        <div key={i} className="absolute pointer-events-none" style={{ left: `${x}%`, top: `${y}%` }}>
          <svg width="60" height="80" viewBox="0 0 60 80">
            <rect x="26" y="45" width="8" height="35" rx="3" fill="#8B6914" />
            <ellipse cx="30" cy="35" rx="28" ry="30" fill="#4CAF50" />
            <ellipse cx="22" cy="38" rx="18" ry="20" fill="#66BB6A" opacity="0.7" />
            <ellipse cx="38" cy="36" rx="18" ry="20" fill="#43A047" opacity="0.7" />
            <ellipse cx="30" cy="30" rx="14" ry="16" fill="#8FE388" opacity="0.3" />
          </svg>
        </div>
      ))}

      {/* Rolling hills + stream */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 400 170" preserveAspectRatio="xMidYMax slice" className="w-full" style={{ height: '38vh', minHeight: '200px' }}>
          <defs>
            <linearGradient id="rg-hill1" x1="200" y1="0" x2="200" y2="170" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#A8E6CF" stopOpacity="0.5" /><stop offset="100%" stopColor="#6BCB77" stopOpacity="0.6" /></linearGradient>
            <linearGradient id="rg-hill2" x1="200" y1="40" x2="200" y2="170" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#8FE388" /><stop offset="100%" stopColor="#57C86D" /></linearGradient>
            <linearGradient id="rg-hill3" x1="200" y1="70" x2="200" y2="170" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#6BCB77" /><stop offset="100%" stopColor="#3A9E4A" /></linearGradient>
            <linearGradient id="rg-water" x1="200" y1="90" x2="200" y2="120" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#87CEEB" stopOpacity="0.6" /><stop offset="100%" stopColor="#45B7D1" stopOpacity="0.4" /></linearGradient>
          </defs>
          <path d="M-20 60C80 35 160 55 240 40C320 55 380 35 420 60V170H-20Z" fill="url(#rg-hill1)" />
          <path d="M-20 80C60 58 140 72 220 60C300 72 360 58 420 80V170H-20Z" fill="url(#rg-hill2)" />
          {/* Stream */}
          <motion.g animate={{ x: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
            <path d="M-20 98C40 92 100 100 160 94C220 100 280 92 340 98C380 94 420 100 420 100V115C380 112 340 118 280 112C220 118 160 112 100 118C40 112 -20 118 -20 118Z" fill="url(#rg-water)" />
          </motion.g>
          {/* Water sparkles */}
          {[60,140,220,300].map((x,i) => (
            <motion.circle key={i} cx={x} cy={106} r="1.5" fill="white" opacity="0.6"
              animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.3, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i*0.4 }} />
          ))}
          {/* Stepping stones */}
          <ellipse cx="120" cy="105" rx="10" ry="4" fill="#9E9E9E" opacity="0.5" />
          <ellipse cx="160" cy="103" rx="8" ry="3.5" fill="#BDBDBD" opacity="0.4" />
          <ellipse cx="200" cy="106" rx="9" ry="3.5" fill="#9E9E9E" opacity="0.5" />
          <path d="M-20 110C50 100 130 108 210 100C290 108 360 100 420 110V170H-20Z" fill="url(#rg-hill3)" />
          {/* Flowers */}
          {[[40,90],[90,82],[180,76],[270,82],[330,88],[370,95]].map(([x,y],i) => (
            <motion.g key={i} animate={{ y: [0, -2, 0] }} transition={{ duration: 2+i*0.3, repeat: Infinity, delay: i*0.3 }}>
              <rect x={x-1} y={y} width="2" height="8" rx="1" fill="#4CAF50" />
              <circle cx={x} cy={y-3} r={3+(i%2)} fill={['#FF8FAB','#A78BFA','#FFE66D','#FF6B6B','#4ECDC4','#FF8C42'][i]} />
              <circle cx={x} cy={y-3} r={1.5+(i%2)*0.5} fill="#FFE66D" opacity="0.6" />
            </motion.g>
          ))}
          {/* Grass */}
          {[[30,105],[150,95],[250,98],[350,102]].map(([x,y],i) => (
            <motion.g key={`g${i}`} animate={{ rotate: [-2,3,-2] }} transition={{ duration: 3.5+i*0.5, repeat: Infinity }} style={{ transformOrigin: `${x}px ${y}px` }}>
              <path d={`M${x-2} ${y}L${x-3} ${y-10}L${x} ${y}`} stroke="#4CAF50" strokeWidth="1.5" fill="none" />
              <path d={`M${x+1} ${y}L${x+2} ${y-12}L${x+4} ${y}`} stroke="#6BCB77" strokeWidth="1.5" fill="none" />
            </motion.g>
          ))}
        </svg>
      </div>

      {/* Floating bubbles */}
      {[[15,45,8],[30,50,6],[70,42,7],[85,48,5]].map(([x,y,s],i) => (
        <motion.div key={i} className="absolute pointer-events-none" style={{ left: `${x}%`, top: `${y}%` }}
          animate={{ y: [0, -15, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 5+i, repeat: Infinity, delay: i*1.2 }}>
          <svg width={s as number * 3} height={s as number * 3} viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="8" fill="none" stroke="#87CEEB" strokeWidth="1.5" opacity="0.5" />
            <circle cx="7" cy="7" r="2" fill="white" opacity="0.4" />
          </svg>
        </motion.div>
      ))}

      {/* Dragonfly */}
      <motion.div className="absolute pointer-events-none" style={{ top: '32%', left: '20%' }}
        animate={{ x: [0, 40, 20, 50, 0], y: [0, -10, 5, -8, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}>
        <svg width="24" height="16" viewBox="0 0 24 16">
          <ellipse cx="12" cy="8" rx="2" ry="6" fill="#45B7D1" />
          <motion.ellipse cx="6" cy="6" rx="6" ry="3" fill="#87CEEB" opacity="0.5" animate={{ scaleY: [1, 0.6, 1] }} transition={{ duration: 0.3, repeat: Infinity }} />
          <motion.ellipse cx="18" cy="6" rx="6" ry="3" fill="#87CEEB" opacity="0.5" animate={{ scaleY: [1, 0.6, 1] }} transition={{ duration: 0.3, repeat: Infinity }} />
        </svg>
      </motion.div>
    </>
  );
}

/** Treehouse Village — cozy warm sunset with wooden treehouse */
function TreehouseScene() {
  return (
    <>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #1A2744 0%, #2C3E6B 20%, #4A6FA5 40%, #FF8C42 70%, #FFB347 90%, #FFD93D 100%)' }} />

      {/* Stars in upper sky */}
      {[[10,4,1.5],[25,8,1],[40,3,1.5],[60,6,1],[75,4,1.5],[90,10,1],[15,14,1],[50,12,1.5]].map(([x,y,r],i) => (
        <motion.div key={i} className="absolute pointer-events-none" style={{ left: `${x}%`, top: `${y}%` }}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 2+i*0.5, repeat: Infinity, delay: i*0.3 }}>
          <svg width={r as number * 4} height={r as number * 4} viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="#FFE66D" /></svg>
        </motion.div>
      ))}

      {/* Treehouse scene at bottom */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
        <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice" className="w-full" style={{ height: '42vh', minHeight: '220px' }}>
          <defs>
            <linearGradient id="th-trunk" x1="180" y1="0" x2="180" y2="200" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#8B6914" /><stop offset="100%" stopColor="#5D4037" /></linearGradient>
            <linearGradient id="th-leaves" x1="180" y1="0" x2="180" y2="100" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#2E7D32" /><stop offset="100%" stopColor="#1B5E20" /></linearGradient>
            <linearGradient id="th-ground" x1="200" y1="140" x2="200" y2="200" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#4CAF50" stopOpacity="0.7" /><stop offset="100%" stopColor="#2E7D32" /></linearGradient>
          </defs>

          {/* Ground hills */}
          <path d="M-20 150C80 130 160 145 240 135C320 145 380 130 420 150V200H-20Z" fill="url(#th-ground)" />
          <path d="M-20 165C60 150 140 160 220 152C300 160 360 150 420 165V200H-20Z" fill="#3A9E4A" opacity="0.7" />

          {/* Big tree trunk */}
          <rect x="165" y="40" width="30" height="160" rx="5" fill="url(#th-trunk)" />
          <rect x="160" y="60" width="40" height="10" rx="3" fill="#6D4C41" opacity="0.3" />
          {/* Roots */}
          <path d="M165 180Q150 185 140 178" stroke="#5D4037" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M195 180Q210 185 220 178" stroke="#5D4037" strokeWidth="6" strokeLinecap="round" fill="none" />

          {/* Tree canopy */}
          <ellipse cx="180" cy="35" rx="70" ry="40" fill="url(#th-leaves)" />
          <ellipse cx="160" cy="40" rx="45" ry="30" fill="#388E3C" opacity="0.7" />
          <ellipse cx="200" cy="38" rx="45" ry="30" fill="#43A047" opacity="0.7" />
          <ellipse cx="180" cy="28" rx="30" ry="20" fill="#4CAF50" opacity="0.4" />

          {/* Treehouse */}
          <rect x="135" y="55" width="50" height="35" rx="3" fill="#8B6914" />
          <rect x="138" y="58" width="20" height="14" rx="2" fill="#FFE0B2" opacity="0.7" />
          <rect x="162" y="58" width="20" height="14" rx="2" fill="#FFE0B2" opacity="0.7" />
          <polygon points="130,58 160,38 190,58" fill="#A1887F" />
          <rect x="150" y="75" width="20" height="15" rx="2" fill="#6D4C41" />
          <circle cx="165" cy="83" r="2" fill="#FFE66D" />

          {/* Ladder */}
          <line x1="158" y1="90" x2="158" y2="140" stroke="#8B6914" strokeWidth="2" />
          <line x1="166" y1="90" x2="166" y2="140" stroke="#8B6914" strokeWidth="2" />
          {[95,105,115,125,135].map(y => <line key={y} x1="158" y1={y} x2="166" y2={y} stroke="#A1887F" strokeWidth="1.5" />)}

          {/* Wooden sign */}
          <motion.g animate={{ rotate: [-2, 2, -2] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '80px 120px' }}>
            <line x1="80" y1="120" x2="80" y2="155" stroke="#5D4037" strokeWidth="3" />
            <rect x="55" y="120" width="50" height="20" rx="3" fill="#8B6914" />
            <rect x="60" y="124" width="40" height="12" rx="2" fill="#A1887F" opacity="0.4" />
          </motion.g>
        </svg>
      </div>

      {/* Hanging lanterns */}
      {[{x:'25%',y:'22%',delay:0},{x:'65%',y:'20%',delay:0.8},{x:'45%',y:'18%',delay:1.5}].map((l,i) => (
        <motion.div key={i} className="absolute pointer-events-none" style={{ left: l.x, top: l.y }}
          animate={{ rotate: [-5, 5, -5], y: [0, -3, 0] }}
          transition={{ duration: 3+i*0.5, repeat: Infinity, ease: 'easeInOut', delay: l.delay }}>
          <svg width="20" height="30" viewBox="0 0 20 30">
            <line x1="10" y1="0" x2="10" y2="8" stroke="#5D4037" strokeWidth="1" />
            <rect x="4" y="8" width="12" height="16" rx="3" fill="#FF8C42" opacity="0.8" />
            <rect x="6" y="10" width="8" height="10" rx="2" fill="#FFD93D" opacity="0.6" />
            <motion.circle cx="10" cy="16" r="4" fill="#FFE66D" opacity="0.4"
              animate={{ opacity: [0.2, 0.5, 0.2], scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 2, repeat: Infinity, delay: i*0.6 }} />
          </svg>
        </motion.div>
      ))}

      {/* Falling leaves */}
      {[{x:20,delay:0},{x:50,delay:2},{x:75,delay:4},{x:35,delay:1},{x:85,delay:3}].map((l,i) => (
        <motion.div key={i} className="absolute pointer-events-none" style={{ left: `${l.x}%`, top: '-5%' }}
          animate={{ y: [0, 500], x: [0, 30, -20, 40, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 12+i*2, repeat: Infinity, ease: 'linear', delay: l.delay }}>
          <svg width="12" height="10" viewBox="0 0 12 10">
            <ellipse cx="6" cy="5" rx="5" ry="3" fill={['#FF8C42','#FFD93D','#FF6B6B','#E67E22','#6BCB77'][i]} opacity="0.6"
              transform="rotate(30 6 5)" />
          </svg>
        </motion.div>
      ))}

      {/* Fireflies */}
      {[[30,35],[60,40],[80,30],[45,45],[15,42]].map(([x,y],i) => (
        <motion.div key={i} className="absolute pointer-events-none" style={{ left: `${x}%`, top: `${y}%` }}
          animate={{ opacity: [0, 0.8, 0], y: [0, -8, 0] }}
          transition={{ duration: 3+i, repeat: Infinity, delay: i*0.8 }}>
          <svg width="6" height="6" viewBox="0 0 6 6"><circle cx="3" cy="3" r="2.5" fill="#FFE66D" /><circle cx="3" cy="3" r="4" fill="#FFE66D" opacity="0.2" /></svg>
        </motion.div>
      ))}
    </>
  );
}

export default function ThemeScene({ theme }: ThemeSceneProps) {
  switch (theme.id) {
    case 'sunny-meadow':
      return <SunnyMeadowScene />;
    case 'sky-islands':
      return <SkyIslandsScene />;
    case 'river-garden':
      return <RiverGardenScene />;
    case 'treehouse':
      return <TreehouseScene />;
    default:
      return <SunnyMeadowScene />;
  }
}
