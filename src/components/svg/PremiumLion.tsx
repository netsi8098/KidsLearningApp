/**
 * PremiumLion — 2.5D-style animated lion mascot.
 * Built from layered SVG parts with gradients, soft shadows, and shading.
 * Supports idle breathing, blinking, waving, and secondary motion on ears/mane/tail.
 */
import { motion } from 'framer-motion';

interface PremiumLionProps {
  size?: number;
  className?: string;
}

export default function PremiumLion({ size = 240, className }: PremiumLionProps) {
  const s = size / 240; // scale factor based on 240px base

  return (
    <div className={className} style={{ width: size, height: size * 1.1 }}>
      <svg viewBox="0 0 240 264" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Body gradient — warm dimensional */}
          <radialGradient id="pl-body" cx="0.45" cy="0.35" r="0.65">
            <stop offset="0%" stopColor="#FFD89E" />
            <stop offset="60%" stopColor="#F5B55A" />
            <stop offset="100%" stopColor="#E89830" />
          </radialGradient>
          {/* Head gradient */}
          <radialGradient id="pl-head" cx="0.45" cy="0.4" r="0.6">
            <stop offset="0%" stopColor="#FFE4B5" />
            <stop offset="55%" stopColor="#FDCF7E" />
            <stop offset="100%" stopColor="#F0A830" />
          </radialGradient>
          {/* Mane gradient — rich amber */}
          <radialGradient id="pl-mane" cx="0.5" cy="0.45" r="0.55">
            <stop offset="0%" stopColor="#E8943A" />
            <stop offset="70%" stopColor="#C57420" />
            <stop offset="100%" stopColor="#A05A10" />
          </radialGradient>
          {/* Belly highlight */}
          <radialGradient id="pl-belly" cx="0.5" cy="0.4" r="0.5">
            <stop offset="0%" stopColor="#FFF3DC" />
            <stop offset="100%" stopColor="#FFE4B5" />
          </radialGradient>
          {/* Cheek blush */}
          <radialGradient id="pl-blush" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#FFAA80" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FFAA80" stopOpacity="0" />
          </radialGradient>
          {/* Shadow */}
          <radialGradient id="pl-shadow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#000" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ── Ground shadow ── */}
        <motion.ellipse
          cx="120" cy="256" rx="65" ry="8"
          fill="url(#pl-shadow)"
          animate={{ scaleX: [1, 1.06, 1], opacity: [0.6, 0.4, 0.6] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* ── Tail ── */}
        <motion.g
          animate={{ rotate: [-8, 12, -8] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '175px 185px' }}
        >
          <path d="M175 185 Q200 170 210 150 Q218 135 225 140 Q230 148 222 158 Q212 172 195 185" fill="url(#pl-body)" stroke="#D4882A" strokeWidth="1" />
          {/* Tail tuft */}
          <circle cx="224" cy="142" r="8" fill="#C57420" />
          <circle cx="224" cy="142" r="5" fill="#E8943A" />
        </motion.g>

        {/* ── Body ── */}
        <motion.g
          animate={{ y: [0, -3, 0], scaleY: [1, 1.015, 1] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '120px 240px' }}
        >
          {/* Body shape */}
          <ellipse cx="120" cy="195" rx="52" ry="48" fill="url(#pl-body)" />
          {/* Body soft shadow */}
          <ellipse cx="120" cy="210" rx="42" ry="15" fill="rgba(0,0,0,0.04)" />
          {/* Belly */}
          <ellipse cx="120" cy="200" rx="32" ry="30" fill="url(#pl-belly)" />

          {/* ── Legs ── */}
          {/* Back legs */}
          <ellipse cx="88" cy="235" rx="16" ry="12" fill="url(#pl-body)" />
          <ellipse cx="152" cy="235" rx="16" ry="12" fill="url(#pl-body)" />
          {/* Front legs */}
          <rect x="95" y="222" width="18" height="28" rx="9" fill="url(#pl-body)" />
          <rect x="127" y="222" width="18" height="28" rx="9" fill="url(#pl-body)" />
          {/* Paw highlights */}
          <ellipse cx="104" cy="248" rx="10" ry="5" fill="#FDCF7E" />
          <ellipse cx="136" cy="248" rx="10" ry="5" fill="#FDCF7E" />
          {/* Toe beans */}
          <circle cx="100" cy="247" r="2.5" fill="#FFE4B5" />
          <circle cx="104" cy="245" r="2.5" fill="#FFE4B5" />
          <circle cx="108" cy="247" r="2.5" fill="#FFE4B5" />

          {/* ── Waving arm ── */}
          <motion.g
            animate={{ rotate: [-5, 15, -5] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '160px 185px' }}
          >
            <path d="M155 185 Q170 175 178 160 Q182 152 186 156 Q188 162 182 172 Q175 182 165 190" fill="url(#pl-body)" stroke="#D4882A" strokeWidth="0.8" />
            <ellipse cx="185" cy="155" rx="6" ry="5" fill="#FDCF7E" />
          </motion.g>

          {/* ── Mane (back layer) ── */}
          <motion.g
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: '120px 120px' }}
          >
            {/* Mane outer ring */}
            <ellipse cx="120" cy="118" rx="58" ry="55" fill="url(#pl-mane)" />
            {/* Mane texture — layered petals */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a) => (
              <ellipse
                key={a}
                cx={120 + 48 * Math.cos(a * Math.PI / 180)}
                cy={118 + 46 * Math.sin(a * Math.PI / 180)}
                rx="16" ry="10"
                fill="#D47E1A"
                opacity="0.4"
                transform={`rotate(${a} ${120 + 48 * Math.cos(a * Math.PI / 180)} ${118 + 46 * Math.sin(a * Math.PI / 180)})`}
              />
            ))}
            {/* Mane inner highlight */}
            <ellipse cx="120" cy="115" rx="44" ry="42" fill="url(#pl-mane)" opacity="0.5" />
          </motion.g>

          {/* ── Head ── */}
          <circle cx="120" cy="115" r="42" fill="url(#pl-head)" />
          {/* Head highlight */}
          <ellipse cx="112" cy="100" rx="22" ry="16" fill="rgba(255,255,255,0.15)" />

          {/* ── Ears ── */}
          <motion.g
            animate={{ rotate: [-3, 5, -3] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
            style={{ transformOrigin: '88px 85px' }}
          >
            <ellipse cx="82" cy="82" rx="14" ry="16" fill="url(#pl-head)" />
            <ellipse cx="82" cy="82" rx="8" ry="10" fill="#FFAA80" opacity="0.4" />
          </motion.g>
          <motion.g
            animate={{ rotate: [3, -5, 3] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
            style={{ transformOrigin: '152px 85px' }}
          >
            <ellipse cx="158" cy="82" rx="14" ry="16" fill="url(#pl-head)" />
            <ellipse cx="158" cy="82" rx="8" ry="10" fill="#FFAA80" opacity="0.4" />
          </motion.g>

          {/* ── Eyes ── */}
          {/* Eye whites */}
          <ellipse cx="106" cy="112" rx="11" ry="12" fill="white" />
          <ellipse cx="134" cy="112" rx="11" ry="12" fill="white" />
          {/* Irises */}
          <motion.g
            animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', times: [0, 0.42, 0.46, 0.5, 1] }}
            style={{ transformOrigin: '120px 112px' }}
          >
            <circle cx="108" cy="112" r="7" fill="#5D3A1A" />
            <circle cx="136" cy="112" r="7" fill="#5D3A1A" />
            {/* Pupils */}
            <circle cx="109" cy="111" r="4" fill="#2D1A0A" />
            <circle cx="137" cy="111" r="4" fill="#2D1A0A" />
            {/* Eye highlights */}
            <circle cx="111" cy="109" r="2.5" fill="white" />
            <circle cx="139" cy="109" r="2.5" fill="white" />
            <circle cx="107" cy="114" r="1.2" fill="white" opacity="0.6" />
            <circle cx="135" cy="114" r="1.2" fill="white" opacity="0.6" />
          </motion.g>

          {/* Eyebrows — subtle expression */}
          <path d="M96 100 Q102 96 112 99" stroke="#8B5A2B" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
          <path d="M128 99 Q138 96 144 100" stroke="#8B5A2B" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />

          {/* ── Cheeks ── */}
          <circle cx="92" cy="120" r="10" fill="url(#pl-blush)" />
          <circle cx="148" cy="120" r="10" fill="url(#pl-blush)" />

          {/* ── Nose & mouth ── */}
          <ellipse cx="120" cy="124" rx="6" ry="4.5" fill="#5D3A1A" />
          {/* Nose highlight */}
          <ellipse cx="118" cy="123" rx="2.5" ry="1.5" fill="rgba(255,255,255,0.3)" />
          {/* Mouth */}
          <path d="M113 130 Q120 137 127 130" stroke="#8B5A2B" strokeWidth="2" strokeLinecap="round" fill="none" />
          <line x1="120" y1="128" x2="120" y2="132" stroke="#8B5A2B" strokeWidth="1.5" />

          {/* ── Whiskers ── */}
          <line x1="95" y1="122" x2="70" y2="118" stroke="#D4882A" strokeWidth="1.2" opacity="0.4" />
          <line x1="95" y1="126" x2="72" y2="128" stroke="#D4882A" strokeWidth="1.2" opacity="0.4" />
          <line x1="145" y1="122" x2="170" y2="118" stroke="#D4882A" strokeWidth="1.2" opacity="0.4" />
          <line x1="145" y1="126" x2="168" y2="128" stroke="#D4882A" strokeWidth="1.2" opacity="0.4" />
        </motion.g>
      </svg>
    </div>
  );
}
