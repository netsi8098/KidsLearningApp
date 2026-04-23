import { motion } from 'framer-motion';

type IllustrationProps = {
  className?: string;
};

export function WelcomeMeadowScene({ className }: IllustrationProps) {
  return (
    <div className={className}>
      <svg viewBox="0 0 420 220" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="meadowSky" x1="210" y1="0" x2="210" y2="220" gradientUnits="userSpaceOnUse">
            <stop stopColor="#BDEBFF" />
            <stop offset="1" stopColor="#8CD7FF" />
          </linearGradient>
          <linearGradient id="meadowGrass" x1="210" y1="132" x2="210" y2="212" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8FE388" />
            <stop offset="1" stopColor="#57C86D" />
          </linearGradient>
        </defs>

        <rect width="420" height="220" rx="36" fill="url(#meadowSky)" />
        <ellipse cx="210" cy="182" rx="176" ry="34" fill="url(#meadowGrass)" />
        <ellipse cx="210" cy="188" rx="132" ry="20" fill="#78D38A" opacity="0.55" />

        <motion.g
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ellipse cx="210" cy="138" rx="30" ry="10" fill="#6EBF79" opacity="0.28" />
          <circle cx="210" cy="108" r="22" fill="#F8B75E" />
          <circle cx="210" cy="104" r="13" fill="#FFE4C6" />
          <circle cx="198" cy="102" r="4" fill="#2D2D3A" />
          <circle cx="222" cy="102" r="4" fill="#2D2D3A" />
          <path d="M203 112C206 115 214 115 217 112" stroke="#A6632A" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="210" cy="140" r="24" fill="#FFC97E" />
          <ellipse cx="194" cy="142" rx="7" ry="14" fill="#F2A14A" />
          <ellipse cx="226" cy="142" rx="7" ry="14" fill="#F2A14A" />
          <circle cx="192" cy="89" r="7" fill="#F8B75E" />
          <circle cx="228" cy="89" r="7" fill="#F8B75E" />
          <circle cx="191" cy="167" r="6" fill="#F8B75E" />
          <circle cx="229" cy="167" r="6" fill="#F8B75E" />
        </motion.g>

        <motion.g
          animate={{ x: [0, 4, 0], y: [0, -3, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        >
          <path d="M104 78C110 62 126 57 137 65C146 72 144 86 130 90C121 92 110 87 104 78Z" fill="#A78BFA" />
          <path d="M145 75C151 60 166 57 177 66C186 73 183 88 169 92C160 94 149 88 145 75Z" fill="#C4B5FD" />
          <rect x="139" y="70" width="5" height="35" rx="2.5" fill="#6D4AA0" />
          <circle cx="142" cy="69" r="3.5" fill="#6D4AA0" />
        </motion.g>

        <motion.g
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        >
          <circle cx="84" cy="171" r="8" fill="#FF6B6B" />
          <rect x="82" y="179" width="4" height="16" rx="2" fill="#59A84B" />
        </motion.g>
        <motion.g
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3.1, repeat: Infinity, ease: 'easeInOut', delay: 0.9 }}
        >
          <circle cx="143" cy="162" r="7" fill="#FFE66D" />
          <rect x="141" y="169" width="4" height="14" rx="2" fill="#59A84B" />
        </motion.g>
        <motion.g
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        >
          <circle cx="290" cy="167" r="7" fill="#A78BFA" />
          <rect x="288" y="174" width="4" height="14" rx="2" fill="#59A84B" />
        </motion.g>
        <motion.g
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3.3, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
        >
          <circle cx="348" cy="173" r="8" fill="#FF8FAB" />
          <rect x="346" y="181" width="4" height="15" rx="2" fill="#59A84B" />
        </motion.g>
      </svg>
    </div>
  );
}

function BadgeShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <svg viewBox="0 0 180 132" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="10" width="168" height="112" rx="24" fill="#FFFDFB" stroke="#F7E7DE" strokeWidth="2" />
        <ellipse cx="90" cy="116" rx="44" ry="7" fill="#F6DACC" opacity="0.5" />
        {children}
      </svg>
    </div>
  );
}

export function ShakeYourBodyBadge({ className }: IllustrationProps) {
  return (
    <BadgeShell className={className}>
      <motion.g
        animate={{ rotate: [-5, 5, -5], y: [0, -2, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '90px 78px' }}
      >
        <circle cx="90" cy="42" r="16" fill="#FFC97E" />
        <rect x="74" y="58" width="32" height="30" rx="14" fill="#FF6B6B" />
        <path d="M79 66C69 72 64 78 61 90" stroke="#FF9F43" strokeWidth="6" strokeLinecap="round" />
        <path d="M101 66C112 72 117 79 120 90" stroke="#FF9F43" strokeWidth="6" strokeLinecap="round" />
        <path d="M83 88C76 96 73 104 72 111" stroke="#4ECDC4" strokeWidth="6" strokeLinecap="round" />
        <path d="M97 88C104 96 108 104 109 111" stroke="#4ECDC4" strokeWidth="6" strokeLinecap="round" />
        <circle cx="84" cy="40" r="2.8" fill="#2D2D3A" />
        <circle cx="96" cy="40" r="2.8" fill="#2D2D3A" />
        <path d="M84 49C87 52 93 52 96 49" stroke="#A6632A" strokeWidth="2.5" strokeLinecap="round" />
      </motion.g>
      <motion.path
        d="M52 36C48 41 48 47 52 52"
        stroke="#FF8FAB"
        strokeWidth="3"
        strokeLinecap="round"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 0.9, repeat: Infinity }}
      />
      <motion.path
        d="M128 36C132 41 132 47 128 52"
        stroke="#FF8FAB"
        strokeWidth="3"
        strokeLinecap="round"
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 0.9, repeat: Infinity }}
      />
      <motion.circle
        cx="43"
        cy="70"
        r="5"
        fill="#FFE66D"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
      />
      <motion.circle
        cx="138"
        cy="80"
        r="4"
        fill="#A78BFA"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, delay: 0.5 }}
      />
    </BadgeShell>
  );
}

export function AnimalDanceBadge({ className }: IllustrationProps) {
  return (
    <BadgeShell className={className}>
      <motion.g
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <circle cx="90" cy="45" r="17" fill="#F8B75E" />
        <circle cx="75" cy="32" r="7" fill="#F8B75E" />
        <circle cx="105" cy="32" r="7" fill="#F8B75E" />
        <ellipse cx="90" cy="81" rx="25" ry="28" fill="#FFC97E" />
        <circle cx="84" cy="44" r="3.2" fill="#2D2D3A" />
        <circle cx="96" cy="44" r="3.2" fill="#2D2D3A" />
        <path d="M85 54C88 57 92 57 95 54" stroke="#8B5A2B" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M66 74C56 72 50 67 45 60" stroke="#FF8FAB" strokeWidth="5" strokeLinecap="round" />
        <path d="M114 74C124 72 130 67 135 60" stroke="#4ECDC4" strokeWidth="5" strokeLinecap="round" />
        <path d="M79 104C75 111 71 115 67 118" stroke="#F4A261" strokeWidth="6" strokeLinecap="round" />
        <path d="M101 104C106 111 110 115 114 118" stroke="#F4A261" strokeWidth="6" strokeLinecap="round" />
      </motion.g>
      <motion.g
        animate={{ rotate: [0, 12, 0, -12, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '45px 56px' }}
      >
        <circle cx="45" cy="56" r="7" fill="#FFE66D" />
        <circle cx="39" cy="50" r="4.5" fill="#FF6B6B" />
        <circle cx="51" cy="50" r="4.5" fill="#FF8FAB" />
      </motion.g>
      <motion.g
        animate={{ rotate: [0, -10, 0, 10, 0] }}
        transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        style={{ transformOrigin: '136px 52px' }}
      >
        <circle cx="136" cy="52" r="6" fill="#A78BFA" />
        <path d="M136 58V70" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" />
        <path d="M130 64H142" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" />
      </motion.g>
    </BadgeShell>
  );
}

export function RainbowDanceBadge({ className }: IllustrationProps) {
  return (
    <BadgeShell className={className}>
      <motion.path d="M48 92C60 62 84 42 90 42C96 42 120 62 132 92" stroke="#FF6B6B" strokeWidth="10" strokeLinecap="round" fill="none" />
      <motion.path d="M57 92C67 69 85 53 90 53C95 53 113 69 123 92" stroke="#FFB347" strokeWidth="10" strokeLinecap="round" fill="none" />
      <motion.path d="M66 92C74 75 87 63 90 63C93 63 106 75 114 92" stroke="#FFE66D" strokeWidth="10" strokeLinecap="round" fill="none" />
      <motion.path d="M74 92C80 80 88 73 90 73C92 73 100 80 106 92" stroke="#6BCB77" strokeWidth="10" strokeLinecap="round" fill="none" />
      <motion.g
        animate={{ x: [-4, 4, -4], y: [0, -3, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <circle cx="90" cy="101" r="13" fill="#45B7D1" />
        <path d="M76 92C69 99 64 105 61 112" stroke="#8FE388" strokeWidth="5" strokeLinecap="round" />
        <path d="M104 92C111 99 116 105 119 112" stroke="#8FE388" strokeWidth="5" strokeLinecap="round" />
      </motion.g>
      <motion.circle cx="43" cy="46" r="7" fill="#FFFFFF" animate={{ x: [0, 8, 0] }} transition={{ duration: 4, repeat: Infinity }} />
      <motion.circle cx="134" cy="41" r="9" fill="#FFE66D" animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 2, repeat: Infinity }} />
    </BadgeShell>
  );
}

export function SimonSaysBadge({ className }: IllustrationProps) {
  return (
    <BadgeShell className={className}>
      <motion.g
        animate={{ rotate: [0, -6, 0, 6, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '66px 68px' }}
      >
        <circle cx="66" cy="68" r="22" fill="#FF6B6B" />
        <circle cx="66" cy="68" r="14" fill="#FFFDFB" />
        <circle cx="66" cy="68" r="7" fill="#4ECDC4" />
        <circle cx="66" cy="68" r="2.5" fill="#2D2D3A" />
      </motion.g>
      <motion.path
        d="M66 46L75 28"
        stroke="#8B5A2B"
        strokeWidth="4"
        strokeLinecap="round"
        animate={{ rotate: [0, 5, 0, -5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{ transformOrigin: '66px 46px' }}
      />
      <motion.g
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
      >
        <rect x="98" y="46" width="36" height="30" rx="8" fill="#FFF0F0" stroke="#FFD4D4" strokeWidth="2" />
        <path d="M108 57H124" stroke="#FF6B6B" strokeWidth="4" strokeLinecap="round" />
        <path d="M108 65H120" stroke="#FFB347" strokeWidth="4" strokeLinecap="round" />
      </motion.g>
      <motion.path d="M36 100C47 93 57 92 69 96" stroke="#A78BFA" strokeWidth="5" strokeLinecap="round" animate={{ pathLength: [0.75, 1, 0.75] }} transition={{ duration: 1.7, repeat: Infinity }} />
    </BadgeShell>
  );
}

export function FollowTheLeaderBadge({ className }: IllustrationProps) {
  return (
    <BadgeShell className={className}>
      {/* Leader */}
      <motion.g animate={{ x: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
        <circle cx="60" cy="50" r="12" fill="#4ECDC4" />
        <rect x="50" y="62" width="20" height="22" rx="10" fill="#45B7D1" />
        <path d="M55 84C52 92 50 98 48 106" stroke="#4ECDC4" strokeWidth="5" strokeLinecap="round" />
        <path d="M65 84C68 92 70 98 72 106" stroke="#4ECDC4" strokeWidth="5" strokeLinecap="round" />
        <circle cx="55" cy="48" r="2" fill="#2D2D3A" /><circle cx="65" cy="48" r="2" fill="#2D2D3A" />
      </motion.g>
      {/* Follower 1 */}
      <motion.g animate={{ x: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}>
        <circle cx="100" cy="55" r="10" fill="#FF8FAB" />
        <rect x="92" y="65" width="16" height="18" rx="8" fill="#FF6B6B" />
        <circle cx="96" cy="53" r="1.8" fill="#2D2D3A" /><circle cx="104" cy="53" r="1.8" fill="#2D2D3A" />
      </motion.g>
      {/* Follower 2 */}
      <motion.g animate={{ x: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}>
        <circle cx="132" cy="58" r="9" fill="#FFE66D" />
        <rect x="125" y="67" width="14" height="16" rx="7" fill="#FFD93D" />
        <circle cx="129" cy="56" r="1.5" fill="#2D2D3A" /><circle cx="135" cy="56" r="1.5" fill="#2D2D3A" />
      </motion.g>
      <motion.path d="M72 78 Q86 72 92 78" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" animate={{ strokeDashoffset: [0, 8] }} transition={{ duration: 1, repeat: Infinity }} />
      <motion.path d="M110 80 Q120 75 124 80" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" animate={{ strokeDashoffset: [0, 8] }} transition={{ duration: 1, repeat: Infinity, delay: 0.3 }} />
    </BadgeShell>
  );
}

export function ObstacleCourseBadge({ className }: IllustrationProps) {
  return (
    <BadgeShell className={className}>
      {/* Hurdles */}
      <rect x="40" y="85" width="6" height="28" rx="2" fill="#FF8C42" />
      <rect x="60" y="85" width="6" height="28" rx="2" fill="#FF8C42" />
      <rect x="38" y="83" width="30" height="5" rx="2" fill="#FFB347" />
      <rect x="100" y="78" width="6" height="35" rx="2" fill="#4ECDC4" />
      <rect x="120" y="78" width="6" height="35" rx="2" fill="#4ECDC4" />
      <rect x="98" y="76" width="30" height="5" rx="2" fill="#6BCB77" />
      {/* Jumping figure */}
      <motion.g animate={{ y: [0, -14, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}>
        <circle cx="82" cy="52" r="11" fill="#FFC97E" />
        <rect x="74" y="63" width="16" height="18" rx="8" fill="#A78BFA" />
        <path d="M76 81C73 88 72 94 71 100" stroke="#8B5CF6" strokeWidth="5" strokeLinecap="round" />
        <path d="M88 81C91 88 92 94 93 100" stroke="#8B5CF6" strokeWidth="5" strokeLinecap="round" />
        <circle cx="77" cy="50" r="2" fill="#2D2D3A" /><circle cx="87" cy="50" r="2" fill="#2D2D3A" />
        <path d="M78 58C80 60 84 60 86 58" stroke="#8B5A2B" strokeWidth="2" strokeLinecap="round" />
      </motion.g>
      <motion.circle cx="145" cy="44" r="5" fill="#FFE66D" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
    </BadgeShell>
  );
}

export function MorningStretchesBadge({ className }: IllustrationProps) {
  return (
    <BadgeShell className={className}>
      {/* Sun */}
      <motion.g animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '140px 35px' }}>
        <circle cx="140" cy="35" r="16" fill="#FFE66D" />
        {[0,45,90,135,180,225,270,315].map(a => <line key={a} x1={140+14*Math.cos(a*Math.PI/180)} y1={35+14*Math.sin(a*Math.PI/180)} x2={140+20*Math.cos(a*Math.PI/180)} y2={35+20*Math.sin(a*Math.PI/180)} stroke="#FFD93D" strokeWidth="2.5" strokeLinecap="round" />)}
      </motion.g>
      {/* Stretching figure */}
      <motion.g animate={{ scaleY: [1, 1.06, 1] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '80px 110px' }}>
        <circle cx="80" cy="42" r="13" fill="#FFC97E" />
        <rect x="70" y="55" width="20" height="26" rx="10" fill="#6BCB77" />
        <path d="M72 58C60 48 52 38 48 30" stroke="#8FE388" strokeWidth="5" strokeLinecap="round" />
        <path d="M88 58C100 48 108 38 112 30" stroke="#8FE388" strokeWidth="5" strokeLinecap="round" />
        <path d="M76 81C73 92 72 100 71 108" stroke="#4ECDC4" strokeWidth="5" strokeLinecap="round" />
        <path d="M84 81C87 92 88 100 89 108" stroke="#4ECDC4" strokeWidth="5" strokeLinecap="round" />
        <circle cx="75" cy="40" r="2" fill="#2D2D3A" /><circle cx="85" cy="40" r="2" fill="#2D2D3A" />
        <path d="M76 48C78 50 82 50 84 48" stroke="#8B5A2B" strokeWidth="2" strokeLinecap="round" />
      </motion.g>
    </BadgeShell>
  );
}

export function AnimalStretchesBadge({ className }: IllustrationProps) {
  return (
    <BadgeShell className={className}>
      {/* Cat stretching */}
      <motion.g animate={{ scaleX: [1, 1.08, 1] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '90px 80px' }}>
        <ellipse cx="90" cy="78" rx="35" ry="18" fill="#FF8C42" />
        <circle cx="60" cy="68" r="14" fill="#FF8C42" />
        <polygon points="50,58 46,44 56,54" fill="#FF8C42" />
        <polygon points="68,56 72,44 64,54" fill="#FF8C42" />
        <circle cx="55" cy="66" r="2.5" fill="#2D2D3A" /><circle cx="65" cy="66" r="2.5" fill="#2D2D3A" />
        <ellipse cx="60" cy="72" rx="2" ry="1.5" fill="#333" />
        <path d="M120 74 Q132 70 138 76" fill="none" stroke="#FF8C42" strokeWidth="4" strokeLinecap="round" />
        <path d="M72 92 L68 108" stroke="#E67E22" strokeWidth="4" strokeLinecap="round" />
        <path d="M82 94 L80 110" stroke="#E67E22" strokeWidth="4" strokeLinecap="round" />
        <path d="M100 94 L102 110" stroke="#E67E22" strokeWidth="4" strokeLinecap="round" />
        <path d="M110 92 L114 108" stroke="#E67E22" strokeWidth="4" strokeLinecap="round" />
      </motion.g>
      <motion.circle cx="44" cy="92" r="4" fill="#FFE66D" animate={{ y: [0, -3, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
      <motion.circle cx="142" cy="56" r="5" fill="#A78BFA" animate={{ y: [0, -4, 0] }} transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }} />
    </BadgeShell>
  );
}

export function YogaForKidsBadge({ className }: IllustrationProps) {
  return (
    <BadgeShell className={className}>
      {/* Tree pose figure */}
      <motion.g animate={{ rotate: [-2, 2, -2] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: '90px 110px' }}>
        <circle cx="90" cy="38" r="13" fill="#FFC97E" />
        <rect x="80" y="51" width="20" height="28" rx="10" fill="#A78BFA" />
        <path d="M82 54C70 46 62 40 56 34" stroke="#C4B5FD" strokeWidth="5" strokeLinecap="round" />
        <path d="M98 54C110 46 118 40 124 34" stroke="#C4B5FD" strokeWidth="5" strokeLinecap="round" />
        <path d="M86 79C86 94 86 104 86 112" stroke="#8B5CF6" strokeWidth="5" strokeLinecap="round" />
        <path d="M94 79C94 88 100 92 106 96" stroke="#8B5CF6" strokeWidth="5" strokeLinecap="round" />
        <circle cx="85" cy="36" r="2" fill="#2D2D3A" /><circle cx="95" cy="36" r="2" fill="#2D2D3A" />
        <path d="M86 44C88 46 92 46 94 44" stroke="#8B5A2B" strokeWidth="2" strokeLinecap="round" />
      </motion.g>
      {/* Peaceful sparkles */}
      <motion.circle cx="50" cy="60" r="4" fill="#6BCB77" animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
      <motion.circle cx="130" cy="55" r="3.5" fill="#4ECDC4" animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.2, repeat: Infinity, delay: 0.5 }} />
      <motion.circle cx="45" cy="95" r="3" fill="#FFE66D" animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.8, repeat: Infinity, delay: 0.8 }} />
    </BadgeShell>
  );
}

export function FreezeDanceBadge({ className }: IllustrationProps) {
  return (
    <BadgeShell className={className}>
      {/* Dancing then freezing figure */}
      <motion.g
        animate={{ rotate: [-8, 8, -8, 0, 0, 0], y: [0, -3, 0, 0, 0, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', times: [0, 0.2, 0.4, 0.5, 0.9, 1] }}
        style={{ transformOrigin: '90px 90px' }}
      >
        <circle cx="90" cy="42" r="14" fill="#FFC97E" />
        <rect x="78" y="56" width="24" height="24" rx="12" fill="#FF6B6B" />
        <path d="M80 60C68 54 58 52 50 56" stroke="#FF9F43" strokeWidth="5" strokeLinecap="round" />
        <path d="M100 60C112 54 122 52 130 56" stroke="#FF9F43" strokeWidth="5" strokeLinecap="round" />
        <path d="M84 80C80 90 78 98 76 108" stroke="#4ECDC4" strokeWidth="5" strokeLinecap="round" />
        <path d="M96 80C100 90 102 98 104 108" stroke="#4ECDC4" strokeWidth="5" strokeLinecap="round" />
        <circle cx="84" cy="40" r="2.5" fill="#2D2D3A" /><circle cx="96" cy="40" r="2.5" fill="#2D2D3A" />
        <path d="M85 49C87 51 93 51 95 49" stroke="#8B5A2B" strokeWidth="2" strokeLinecap="round" />
      </motion.g>
      {/* Freeze sparkle burst */}
      <motion.g animate={{ opacity: [0, 0, 0, 1, 1, 0] }} transition={{ duration: 3, repeat: Infinity, times: [0, 0.4, 0.49, 0.5, 0.85, 1] }}>
        <circle cx="50" cy="38" r="5" fill="#87CEEB" /><circle cx="130" cy="42" r="4" fill="#87CEEB" />
        <circle cx="55" cy="98" r="4" fill="#87CEEB" /><circle cx="125" cy="95" r="5" fill="#87CEEB" />
        <path d="M42 65L38 61M42 65L46 61M42 65L42 59" stroke="#45B7D1" strokeWidth="2" strokeLinecap="round" />
        <path d="M138 72L134 68M138 72L142 68M138 72L138 66" stroke="#45B7D1" strokeWidth="2" strokeLinecap="round" />
      </motion.g>
    </BadgeShell>
  );
}

export function MovementIllustrationByTitle({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  const t = title.toLowerCase();
  if (t.includes('shake')) return <ShakeYourBodyBadge className={className} />;
  if (t.includes('animal dance')) return <AnimalDanceBadge className={className} />;
  if (t.includes('rainbow')) return <RainbowDanceBadge className={className} />;
  if (t.includes('simon')) return <SimonSaysBadge className={className} />;
  if (t.includes('follow')) return <FollowTheLeaderBadge className={className} />;
  if (t.includes('obstacle')) return <ObstacleCourseBadge className={className} />;
  if (t.includes('morning')) return <MorningStretchesBadge className={className} />;
  if (t.includes('animal stretch')) return <AnimalStretchesBadge className={className} />;
  if (t.includes('yoga')) return <YogaForKidsBadge className={className} />;
  if (t.includes('freeze')) return <FreezeDanceBadge className={className} />;
  return null;
}
