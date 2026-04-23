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

/** River Garden — matches user reference: central hill, waterfall, river, stepping stones,
 * rounded trees, alphabet bubbles, fish, rainbow, sparkles */
function RiverGardenScene() {
  return (
    <>
      {/* ── Sky with warm glow ── */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #6EC6E6 0%, #90D4ED 30%, #B5E3C4 60%, #C8E6C9 100%)' }} />
      {/* Sky glow behind center */}
      <div className="absolute pointer-events-none" style={{ top: '10%', left: '50%', transform: 'translateX(-50%)', width: '80%', height: '50%', background: 'radial-gradient(ellipse, rgba(255,250,220,0.3) 0%, transparent 70%)', borderRadius: '50%' }} />

      {/* ── Soft clouds ── */}
      <motion.div className="absolute pointer-events-none" style={{ top: '4%', left: '3%' }} animate={{ x: [0, 15, 0] }} transition={{ duration: 22, repeat: Infinity }}>
        <svg width="130" height="50" viewBox="0 0 130 50"><ellipse cx="65" cy="28" rx="55" ry="20" fill="white" opacity="0.7" /><ellipse cx="42" cy="30" rx="35" ry="15" fill="white" opacity="0.6" /><ellipse cx="88" cy="30" rx="35" ry="15" fill="white" opacity="0.6" /></svg>
      </motion.div>
      <motion.div className="absolute pointer-events-none" style={{ top: '8%', right: '5%' }} animate={{ x: [0, -10, 0] }} transition={{ duration: 28, repeat: Infinity }}>
        <svg width="90" height="38" viewBox="0 0 90 38"><ellipse cx="45" cy="20" rx="40" ry="16" fill="white" opacity="0.6" /><ellipse cx="30" cy="22" rx="25" ry="10" fill="white" opacity="0.5" /><ellipse cx="60" cy="22" rx="25" ry="10" fill="white" opacity="0.5" /></svg>
      </motion.div>

      {/* ── Faint rainbow on right ── */}
      <motion.div className="absolute pointer-events-none" style={{ top: '12%', right: '2%' }}
        animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 8, repeat: Infinity }}>
        <svg width="160" height="120" viewBox="0 0 160 120">
          {[{r:55,c:'#FF6B6B'},{r:50,c:'#FF8C42'},{r:45,c:'#FFE66D'},{r:40,c:'#6BCB77'},{r:35,c:'#45B7D1'},{r:30,c:'#A78BFA'}].map(({r,c}) => (
            <path key={c} d={`M${80-r} 110 A${r} ${r} 0 0 1 ${80+r} 110`} stroke={c} strokeWidth="4" fill="none" opacity="0.35" />
          ))}
        </svg>
      </motion.div>

      {/* ── Full landscape SVG — integrated world ── */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ zIndex: 1 }}>
        <svg viewBox="0 0 400 280" preserveAspectRatio="xMidYMax slice" className="w-full" style={{ height: '65vh', minHeight: '340px' }}>
          <defs>
            <linearGradient id="rg2-hill-back" x1="200" y1="0" x2="200" y2="280" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#8FE388" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#4CAF50" />
            </linearGradient>
            <linearGradient id="rg2-hill-main" x1="200" y1="50" x2="200" y2="200" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7DD88A" />
              <stop offset="50%" stopColor="#6BCB77" />
              <stop offset="100%" stopColor="#4CAF50" />
            </linearGradient>
            <linearGradient id="rg2-water" x1="200" y1="0" x2="200" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#5CC8E0" stopOpacity="0.7" />
              <stop offset="50%" stopColor="#45B7D1" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#3AA5C0" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="rg2-waterfall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#87CEEB" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#45B7D1" stopOpacity="0.5" />
            </linearGradient>
            <radialGradient id="rg2-hill-light" cx="0.5" cy="0.3" r="0.6">
              <stop offset="0%" stopColor="#A8E6CF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Back hills — far depth */}
          <path d="M-20 100 C40 70 100 90 160 75 C220 90 280 70 340 85 C380 75 420 100 420 100 V280 H-20Z" fill="url(#rg2-hill-back)" />

          {/* Left rounded tree */}
          <rect x="20" y="65" width="12" height="50" rx="4" fill="#6D4C41" />
          <ellipse cx="26" cy="48" rx="30" ry="32" fill="#388E3C" />
          <ellipse cx="18" cy="52" rx="20" ry="22" fill="#43A047" opacity="0.7" />
          <ellipse cx="34" cy="50" rx="20" ry="22" fill="#4CAF50" opacity="0.7" />
          <ellipse cx="26" cy="42" rx="14" ry="16" fill="#66BB6A" opacity="0.4" />

          {/* Right rounded tree */}
          <rect x="340" y="70" width="10" height="45" rx="3" fill="#6D4C41" />
          <ellipse cx="345" cy="55" rx="28" ry="30" fill="#2E7D32" />
          <ellipse cx="337" cy="58" rx="18" ry="20" fill="#388E3C" opacity="0.7" />
          <ellipse cx="353" cy="56" rx="18" ry="20" fill="#43A047" opacity="0.7" />

          {/* Small bush left */}
          <ellipse cx="75" cy="95" rx="20" ry="15" fill="#4CAF50" />
          <ellipse cx="75" cy="93" rx="14" ry="11" fill="#66BB6A" opacity="0.6" />

          {/* Small bush right */}
          <ellipse cx="310" cy="90" rx="18" ry="14" fill="#388E3C" />
          <ellipse cx="310" cy="88" rx="12" ry="10" fill="#43A047" opacity="0.6" />

          {/* ── Central hill/island — where lion sits ── */}
          <ellipse cx="200" cy="130" rx="90" ry="30" fill="url(#rg2-hill-main)" />
          {/* Hill highlight */}
          <ellipse cx="195" cy="125" rx="60" ry="18" fill="url(#rg2-hill-light)" />
          {/* Hill shadow edge */}
          <ellipse cx="200" cy="138" rx="80" ry="12" fill="rgba(0,0,0,0.06)" />

          {/* Flowers on hill */}
          ${[{x:135,y:120},{x:155,y:115},{x:245,y:118},{x:260,y:122}].map(({x,y},i) => `
            <rect x="${x-0.8}" y="${y}" width="1.6" height="6" rx="0.8" fill="#4CAF50" />
            <circle cx="${x}" cy="${y-3}" r="${2.5+i%2}" fill="${['#FF8FAB','#A78BFA','#FFE66D','#FF6B6B'][i]}" />
            <circle cx="${x}" cy="${y-3}" r="${1+i%2*0.5}" fill="#FFE66D" opacity="0.6" />
          `).join('')}

          {/* ── Waterfall on left ── */}
          <motion.g animate={{ y: [0, 2, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
            <rect x="58" y="100" width="16" height="60" rx="4" fill="url(#rg2-waterfall)" />
            <rect x="61" y="100" width="4" height="60" fill="white" opacity="0.15" />
            <rect x="69" y="105" width="3" height="55" fill="white" opacity="0.1" />
          </motion.g>
          {/* Waterfall splash */}
          <motion.g animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }}>
            <ellipse cx="66" cy="162" rx="14" ry="5" fill="#87CEEB" opacity="0.4" />
            <circle cx="60" cy="158" r="2" fill="white" opacity="0.3" />
            <circle cx="72" cy="156" r="1.5" fill="white" opacity="0.25" />
          </motion.g>

          {/* ── River/water band wrapping across ── */}
          <motion.g animate={{ x: [0, -3, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
            <path d="M-20 155 C40 148 90 160 140 155 C190 148 240 158 290 152 C330 158 370 150 420 158 V195 C370 188 330 198 290 192 C240 198 190 188 140 195 C90 200 40 190 -20 195Z" fill="url(#rg2-water)" />
          </motion.g>
          {/* Water shimmer highlights */}
          ${[50,120,200,280,350].map((x,i) => `
            <motion.circle cx="${x}" cy="${170+i%2*4}" r="1.5" fill="white" opacity="0.5" />
          `).join('')}

          {/* ── Stepping stones on right ── */}
          <ellipse cx="280" cy="168" rx="12" ry="5" fill="#A1887F" /><ellipse cx="280" cy="167" rx="10" ry="4" fill="#BDBDBD" opacity="0.4" />
          <ellipse cx="305" cy="172" rx="10" ry="4.5" fill="#9E9E9E" /><ellipse cx="305" cy="171" rx="8" ry="3.5" fill="#BDBDBD" opacity="0.3" />
          <ellipse cx="328" cy="168" rx="11" ry="5" fill="#A1887F" /><ellipse cx="328" cy="167" rx="9" ry="4" fill="#BDBDBD" opacity="0.4" />

          {/* ── Foreground bank ── */}
          <path d="M-20 190 C60 182 130 192 200 185 C270 192 340 182 420 190 V280 H-20Z" fill="#57C86D" />
          <path d="M-20 205 C50 198 120 206 200 200 C280 206 350 198 420 205 V280 H-20Z" fill="#4CAF50" />

          {/* Foreground flowers */}
          ${[{x:40,y:200},{x:100,y:195},{x:300,y:198},{x:360,y:202}].map(({x,y},i) => `
            <rect x="${x-1}" y="${y}" width="2" height="10" rx="1" fill="#4CAF50" />
            <circle cx="${x}" cy="${y-4}" r="${3.5+i%2}" fill="${['#FF6B6B','#FFE66D','#A78BFA','#FF8FAB'][i]}" />
            <circle cx="${x}" cy="${y-4}" r="${1.5+i%2*0.5}" fill="white" opacity="0.4" />
          `).join('')}

          {/* Foreground grass */}
          ${[30,80,170,250,330,380].map((x,i) => `
            <path d="M${x-2} ${205+i%2*3}L${x-3} ${195+i%2*3-8}L${x} ${205+i%2*3}" stroke="#4CAF50" stroke-width="1.5" fill="none" />
            <path d="M${x+1} ${205+i%2*3}L${x+2} ${195+i%2*3-10}L${x+4} ${205+i%2*3}" stroke="#6BCB77" stroke-width="1.5" fill="none" />
          `).join('')}
        </svg>
      </div>

      {/* ── Floating fish ── */}
      <motion.div className="absolute pointer-events-none" style={{ top: '28%', left: '8%' }}
        animate={{ x: [0, 20, 5, 25, 0], y: [0, -8, 3, -5, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}>
        <svg width="32" height="22" viewBox="0 0 32 22">
          <ellipse cx="14" cy="11" rx="12" ry="8" fill="#FF8C42" opacity="0.8" />
          <polygon points="26,11 32,5 32,17" fill="#FF6B6B" opacity="0.7" />
          <circle cx="9" cy="9" r="2.5" fill="white" /><circle cx="10" cy="8.5" r="1.5" fill="#2D2D3A" />
          <path d="M7 14 Q10 16 13 14" stroke="#E67E22" strokeWidth="1" fill="none" />
        </svg>
      </motion.div>
      <motion.div className="absolute pointer-events-none" style={{ top: '35%', right: '12%' }}
        animate={{ x: [0, -15, -5, -20, 0], y: [0, -5, 4, -3, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}>
        <svg width="26" height="18" viewBox="0 0 32 22">
          <ellipse cx="18" cy="11" rx="12" ry="8" fill="#45B7D1" opacity="0.7" />
          <polygon points="6,11 0,5 0,17" fill="#4ECDC4" opacity="0.6" />
          <circle cx="23" cy="9" r="2" fill="white" /><circle cx="22" cy="8.5" r="1.2" fill="#2D2D3A" />
        </svg>
      </motion.div>

      {/* ── Alphabet bubbles ── */}
      <motion.div className="absolute pointer-events-none" style={{ top: '18%', left: '15%' }}
        animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
        <svg width="36" height="36" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="16" fill="rgba(167,139,250,0.25)" stroke="rgba(167,139,250,0.4)" strokeWidth="1.5" />
          <circle cx="13" cy="13" r="3" fill="white" opacity="0.3" />
          <text x="18" y="23" textAnchor="middle" fill="#7C3AED" fontSize="14" fontWeight="bold" fontFamily="sans-serif" opacity="0.8">A</text>
        </svg>
      </motion.div>
      <motion.div className="absolute pointer-events-none" style={{ top: '22%', right: '18%' }}
        animate={{ y: [0, -8, 0], rotate: [0, -4, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}>
        <svg width="32" height="32" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15" fill="rgba(78,205,196,0.2)" stroke="rgba(78,205,196,0.35)" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="2.5" fill="white" opacity="0.3" />
          <text x="18" y="23" textAnchor="middle" fill="#0D9488" fontSize="13" fontWeight="bold" fontFamily="sans-serif" opacity="0.7">B</text>
        </svg>
      </motion.div>

      {/* ── Star sparkle bubbles ── */}
      {[
        { top: '10%', left: '35%', d: 0, s: 28 },
        { top: '15%', right: '8%', d: 1.2, s: 22 },
        { top: '25%', left: '45%', d: 2.5, s: 18 },
        { top: '8%', left: '60%', d: 0.8, s: 24 },
      ].map((p, i) => (
        <motion.div key={i} className="absolute pointer-events-none" style={{ top: p.top, left: (p as any).left, right: (p as any).right }}
          animate={{ y: [0, -8, 0], opacity: [0.3, 0.7, 0.3], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 4 + i, repeat: Infinity, delay: p.d }}>
          <svg width={p.s} height={p.s} viewBox="0 0 24 24">
            <path d="M12 2L13.5 9L20 10L13.5 11L12 18L10.5 11L4 10L10.5 9Z" fill="#FFE66D" opacity="0.5" />
          </svg>
        </motion.div>
      ))}

      {/* ── Floating magical particles ── */}
      {[
        { l: '20%', t: '30%', c: '#A8E6CF', d: 0 },
        { l: '75%', t: '25%', c: '#FFE66D', d: 1 },
        { l: '40%', t: '15%', c: '#FF8FAB', d: 2 },
        { l: '60%', t: '32%', c: '#A78BFA', d: 0.5 },
        { l: '10%', t: '20%', c: '#4ECDC4', d: 1.5 },
        { l: '85%', t: '18%', c: '#FFE66D', d: 3 },
      ].map((p, i) => (
        <motion.div key={`p${i}`} className="absolute pointer-events-none" style={{ left: p.l, top: p.t }}
          animate={{ y: [0, -12, 0], opacity: [0.15, 0.45, 0.15] }}
          transition={{ duration: 5 + i, repeat: Infinity, delay: p.d }}>
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: p.c, boxShadow: `0 0 6px ${p.c}40` }} />
        </motion.div>
      ))}
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
