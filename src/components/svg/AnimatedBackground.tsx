import React from 'react';

interface AnimatedBackgroundProps {
  theme:
    | 'home'
    | 'abc'
    | 'numbers'
    | 'animals'
    | 'colors'
    | 'shapes'
    | 'stories'
    | 'play'
    | 'create'
    | 'wellbeing'
    | 'explore'
    | 'bedtime'
    | 'quiz'
    | 'rewards';
}

/* ─── Home: Blue sky, green meadow, clouds, butterflies, sun, flowers ─── */
function HomeScene() {
  return (
    <svg viewBox="0 0 400 800" fill="none" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      {/* Sky gradient */}
      <defs>
        <linearGradient id="home-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87CEEB" />
          <stop offset="60%" stopColor="#B5E8F7" />
          <stop offset="100%" stopColor="#D4F1D4" />
        </linearGradient>
        <radialGradient id="sun-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#FFE66D" stopOpacity="1" />
          <stop offset="100%" stopColor="#FFE66D" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="800" fill="url(#home-sky)" />

      {/* Sun with rotating rays */}
      <circle cx="320" cy="100" r="50" fill="#FFE66D" opacity="0.3" />
      <g className="animate-sun-rotate" style={{ transformOrigin: '320px 100px' }}>
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => (
          <line
            key={angle}
            x1="320"
            y1="55"
            x2="320"
            y2="40"
            stroke="#FFE66D"
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${angle} 320 100)`}
            opacity="0.5"
          />
        ))}
      </g>
      <circle cx="320" cy="100" r="30" fill="#FFE66D" />
      {/* Sun face */}
      <circle cx="312" cy="95" r="3" fill="#E8A800" />
      <circle cx="328" cy="95" r="3" fill="#E8A800" />
      <path d="M310 107 Q320 115 330 107" stroke="#E8A800" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Clouds */}
      <g className="animate-drift" style={{ animationDuration: '45s' }} opacity="0.85">
        <ellipse cx="60" cy="160" rx="45" ry="20" fill="white" />
        <ellipse cx="90" cy="150" rx="35" ry="18" fill="white" />
        <ellipse cx="40" cy="155" rx="25" ry="15" fill="white" />
      </g>
      <g className="animate-drift" style={{ animationDuration: '55s', animationDelay: '-15s' }} opacity="0.7">
        <ellipse cx="-30" cy="220" rx="40" ry="18" fill="white" />
        <ellipse cx="0" cy="210" rx="30" ry="16" fill="white" />
      </g>
      <g className="animate-drift" style={{ animationDuration: '60s', animationDelay: '-30s' }} opacity="0.6">
        <ellipse cx="-80" cy="130" rx="35" ry="15" fill="white" />
        <ellipse cx="-55" cy="122" rx="28" ry="14" fill="white" />
      </g>

      {/* Meadow hills */}
      <ellipse cx="100" cy="620" rx="250" ry="120" fill="#8BC78B" />
      <ellipse cx="320" cy="650" rx="200" ry="100" fill="#7CBF7C" />
      <rect x="0" y="660" width="400" height="140" fill="#6BCB77" />

      {/* Flowers */}
      {[50, 120, 200, 280, 350].map((x, i) => (
        <g key={i} className="animate-sway" style={{ animationDelay: `${i * 0.4}s`, transformOrigin: `${x}px 750px` }}>
          <line x1={x} y1="750" x2={x} y2={710} stroke="#4CAF50" strokeWidth="3" strokeLinecap="round" />
          <circle cx={x} cy={705} r={8} fill={['#FF6B6B', '#FFE66D', '#FF8C42', '#A78BFA', '#FF6B6B'][i]} />
          <circle cx={x} cy={705} r={3} fill="#FFE66D" />
        </g>
      ))}

      {/* Butterflies */}
      <g className="animate-float-gentle" style={{ animationDelay: '0s' }}>
        <g transform="translate(150, 350)">
          <ellipse cx="-8" cy="-4" rx="8" ry="5" fill="#A78BFA" opacity="0.8" />
          <ellipse cx="8" cy="-4" rx="8" ry="5" fill="#A78BFA" opacity="0.8" />
          <ellipse cx="-5" cy="3" rx="5" ry="3" fill="#C4A8FF" opacity="0.7" />
          <ellipse cx="5" cy="3" rx="5" ry="3" fill="#C4A8FF" opacity="0.7" />
          <ellipse cx="0" cy="0" rx="1.5" ry="6" fill="#5D3F8E" />
        </g>
      </g>
      <g className="animate-float-gentle" style={{ animationDelay: '1.5s' }}>
        <g transform="translate(280, 420)">
          <ellipse cx="-7" cy="-3" rx="7" ry="4" fill="#FF8C42" opacity="0.8" />
          <ellipse cx="7" cy="-3" rx="7" ry="4" fill="#FF8C42" opacity="0.8" />
          <ellipse cx="-4" cy="3" rx="4" ry="2.5" fill="#FFB074" opacity="0.7" />
          <ellipse cx="4" cy="3" rx="4" ry="2.5" fill="#FFB074" opacity="0.7" />
          <ellipse cx="0" cy="0" rx="1.2" ry="5" fill="#8B4513" />
        </g>
      </g>
    </svg>
  );
}

/* ─── ABC: Green chalkboard, floating chalk letters, dust, wooden desk ─── */
function AbcScene() {
  return (
    <svg viewBox="0 0 400 800" fill="none" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="abc-board" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2D5A27" />
          <stop offset="50%" stopColor="#3A7233" />
          <stop offset="100%" stopColor="#4A3728" />
        </linearGradient>
      </defs>
      <rect width="400" height="800" fill="url(#abc-board)" />

      {/* Chalkboard border */}
      <rect x="15" y="40" width="370" height="500" rx="4" fill="#2D5A27" stroke="#8B6914" strokeWidth="8" />
      {/* Board inner */}
      <rect x="25" y="50" width="350" height="480" fill="#2E6B2E" />

      {/* Chalk lines on board */}
      <line x1="50" y1="150" x2="350" y2="150" stroke="#FFFFFFBB" strokeWidth="1" strokeDasharray="4 6" />
      <line x1="50" y1="250" x2="350" y2="250" stroke="#FFFFFFBB" strokeWidth="1" strokeDasharray="4 6" />
      <line x1="50" y1="350" x2="350" y2="350" stroke="#FFFFFFBB" strokeWidth="1" strokeDasharray="4 6" />

      {/* Floating chalk letters */}
      <g className="animate-float-gentle" style={{ animationDelay: '0s' }}>
        <text x="80" y="200" fontFamily="serif" fontSize="60" fill="#FFFFFFCC" fontWeight="bold" opacity="0.7">A</text>
      </g>
      <g className="animate-float-gentle" style={{ animationDelay: '1s' }}>
        <text x="180" y="300" fontFamily="serif" fontSize="55" fill="#FFE66DCC" fontWeight="bold" opacity="0.6">B</text>
      </g>
      <g className="animate-float-gentle" style={{ animationDelay: '2s' }}>
        <text x="280" y="220" fontFamily="serif" fontSize="50" fill="#87CEEBCC" fontWeight="bold" opacity="0.65">C</text>
      </g>
      <g className="animate-float-gentle" style={{ animationDelay: '0.5s' }}>
        <text x="130" y="400" fontFamily="serif" fontSize="40" fill="#FFB6C1CC" fontWeight="bold" opacity="0.5">D</text>
      </g>
      <g className="animate-float-gentle" style={{ animationDelay: '1.5s' }}>
        <text x="250" y="380" fontFamily="serif" fontSize="45" fill="#98FB98CC" fontWeight="bold" opacity="0.55">E</text>
      </g>

      {/* Chalk dust particles */}
      {[
        { x: 100, y: 180, d: '0s' },
        { x: 220, y: 260, d: '0.8s' },
        { x: 300, y: 170, d: '1.5s' },
        { x: 150, y: 340, d: '2.2s' },
        { x: 330, y: 300, d: '0.4s' },
        { x: 70, y: 310, d: '1.8s' },
      ].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2" fill="white" opacity="0.3" className="animate-float-gentle" style={{ animationDelay: p.d }} />
      ))}

      {/* Wooden desk */}
      <rect x="0" y="560" width="400" height="240" fill="#8B6914" />
      <rect x="0" y="560" width="400" height="15" fill="#A07818" />
      {/* Wood grain lines */}
      <line x1="30" y1="600" x2="370" y2="600" stroke="#7A5D12" strokeWidth="1" opacity="0.4" />
      <line x1="20" y1="650" x2="380" y2="650" stroke="#7A5D12" strokeWidth="1" opacity="0.3" />
      <line x1="40" y1="700" x2="360" y2="700" stroke="#7A5D12" strokeWidth="1" opacity="0.35" />

      {/* Chalk pieces on desk */}
      <rect x="300" y="580" width="30" height="8" rx="3" fill="white" opacity="0.8" transform="rotate(-10 315 584)" />
      <rect x="335" y="585" width="25" height="8" rx="3" fill="#FFE66D" opacity="0.8" transform="rotate(5 347 589)" />
      <rect x="270" y="588" width="20" height="7" rx="3" fill="#87CEEB" opacity="0.7" transform="rotate(-5 280 591)" />

      {/* Eraser */}
      <rect x="60" y="578" width="40" height="20" rx="3" fill="#E8B4B8" stroke="#C89496" strokeWidth="1" />
    </svg>
  );
}

/* ─── Numbers: Deep space, floating numbers, twinkling stars, planet ─── */
function NumbersScene() {
  return (
    <svg viewBox="0 0 400 800" fill="none" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="numbers-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0B1026" />
          <stop offset="50%" stopColor="#1A1A4E" />
          <stop offset="100%" stopColor="#2D1B69" />
        </linearGradient>
        <radialGradient id="num-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#4ECDC4" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#4ECDC4" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="800" fill="url(#numbers-sky)" />

      {/* Stars twinkling */}
      {[
        { x: 30, y: 60, r: 1.5, d: '0s' },
        { x: 120, y: 100, r: 1, d: '0.5s' },
        { x: 250, y: 50, r: 2, d: '1s' },
        { x: 370, y: 130, r: 1.2, d: '1.5s' },
        { x: 80, y: 250, r: 1.5, d: '2s' },
        { x: 350, y: 300, r: 1, d: '0.3s' },
        { x: 190, y: 150, r: 1.8, d: '0.8s' },
        { x: 310, y: 200, r: 1.3, d: '1.2s' },
        { x: 50, y: 400, r: 1, d: '1.8s' },
        { x: 380, y: 500, r: 1.5, d: '0.6s' },
        { x: 150, y: 550, r: 1.2, d: '2.2s' },
        { x: 270, y: 650, r: 1, d: '1.4s' },
        { x: 20, y: 700, r: 1.5, d: '0.9s' },
        { x: 340, y: 720, r: 1.3, d: '1.6s' },
      ].map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity="0.7" className="animate-sparkle" style={{ animationDelay: s.d }} />
      ))}

      {/* Floating numbers with glow */}
      {[
        { n: '1', x: 60, y: 200, size: 50, color: '#FF6B6B', d: '0s' },
        { n: '2', x: 180, y: 130, size: 45, color: '#4ECDC4', d: '0.5s' },
        { n: '3', x: 310, y: 250, size: 55, color: '#FFE66D', d: '1s' },
        { n: '4', x: 100, y: 380, size: 40, color: '#A78BFA', d: '1.5s' },
        { n: '5', x: 260, y: 450, size: 48, color: '#FF8C42', d: '0.8s' },
        { n: '6', x: 50, y: 530, size: 42, color: '#6BCB77', d: '2s' },
        { n: '7', x: 320, y: 560, size: 50, color: '#87CEEB', d: '0.3s' },
        { n: '8', x: 180, y: 650, size: 44, color: '#FFB6C1', d: '1.2s' },
        { n: '9', x: 340, y: 700, size: 46, color: '#DDA0DD', d: '1.8s' },
      ].map((n, i) => (
        <g key={i} className="animate-float-gentle" style={{ animationDelay: n.d }}>
          <circle cx={n.x + 10} cy={n.y - 15} r="30" fill={n.color} opacity="0.08" />
          <text
            x={n.x}
            y={n.y}
            fontFamily="sans-serif"
            fontSize={n.size}
            fill={n.color}
            fontWeight="bold"
            opacity="0.7"
          >
            {n.n}
          </text>
        </g>
      ))}

      {/* Planet in corner */}
      <g transform="translate(340, 80)">
        <circle cx="0" cy="0" r="28" fill="#FF8C42" opacity="0.6" />
        <ellipse cx="0" cy="0" rx="42" ry="8" fill="none" stroke="#FFE66D" strokeWidth="2" opacity="0.4" transform="rotate(-20)" />
        <circle cx="-8" cy="-8" r="5" fill="#E07030" opacity="0.4" />
        <circle cx="10" cy="5" r="3" fill="#E07030" opacity="0.3" />
      </g>
    </svg>
  );
}

/* ─── Animals: Jungle, palm trees, birds, watering hole, grass ─── */
function AnimalsScene() {
  return (
    <svg viewBox="0 0 400 800" fill="none" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="jungle-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87CEEB" />
          <stop offset="40%" stopColor="#90D890" />
          <stop offset="100%" stopColor="#3A7233" />
        </linearGradient>
      </defs>
      <rect width="400" height="800" fill="url(#jungle-sky)" />

      {/* Jungle canopy layers */}
      <ellipse cx="80" cy="200" rx="120" ry="80" fill="#2E7D32" opacity="0.6" />
      <ellipse cx="300" cy="180" rx="140" ry="90" fill="#388E3C" opacity="0.5" />
      <ellipse cx="200" cy="250" rx="180" ry="70" fill="#2E7D32" opacity="0.5" />

      {/* Palm tree left */}
      <g className="animate-sway" style={{ transformOrigin: '70px 600px' }}>
        <rect x="65" y="350" width="12" height="250" rx="4" fill="#8B6914" />
        {/* Fronds */}
        <path d="M71 350 Q30 310 10 330 Q40 320 71 340" fill="#4CAF50" />
        <path d="M71 350 Q110 300 130 320 Q100 315 71 340" fill="#388E3C" />
        <path d="M71 345 Q20 280 5 310 Q35 290 71 335" fill="#66BB6A" />
        <path d="M71 345 Q120 270 140 300 Q110 285 71 335" fill="#4CAF50" />
        <path d="M71 340 Q71 280 71 310" fill="none" stroke="#388E3C" strokeWidth="3" />
      </g>

      {/* Palm tree right */}
      <g className="animate-sway" style={{ transformOrigin: '340px 600px', animationDelay: '1s' }}>
        <rect x="335" y="380" width="11" height="220" rx="4" fill="#795C10" />
        <path d="M340 380 Q300 340 280 360 Q310 350 340 370" fill="#4CAF50" />
        <path d="M340 380 Q380 330 395 350 Q370 340 340 370" fill="#388E3C" />
        <path d="M340 375 Q290 310 275 340 Q300 320 340 365" fill="#66BB6A" />
        <path d="M340 375 Q390 310 400 340 Q380 320 340 365" fill="#4CAF50" />
      </g>

      {/* Ground */}
      <rect x="0" y="600" width="400" height="200" fill="#4CAF50" />
      <ellipse cx="200" cy="600" rx="220" ry="30" fill="#388E3C" />

      {/* Watering hole */}
      <ellipse cx="200" cy="700" rx="100" ry="35" fill="#4ECDC4" opacity="0.6" />
      <ellipse cx="200" cy="695" rx="85" ry="28" fill="#87CEEB" opacity="0.4" />

      {/* Grass tufts */}
      {[30, 90, 160, 250, 310, 370].map((x, i) => (
        <g key={i} className="animate-sway" style={{ animationDelay: `${i * 0.3}s`, transformOrigin: `${x}px 600px` }}>
          <path d={`M${x} 600 Q${x - 5} 580 ${x - 2} 570`} stroke="#2E7D32" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d={`M${x} 600 Q${x + 3} 575 ${x + 1} 565`} stroke="#388E3C" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d={`M${x} 600 Q${x + 8} 582 ${x + 6} 572`} stroke="#2E7D32" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      ))}

      {/* Flying birds */}
      <g className="animate-drift" style={{ animationDuration: '20s' }}>
        <path d="M-20 180 Q-15 172 -10 180 Q-5 172 0 180" stroke="#333" strokeWidth="2" fill="none" />
      </g>
      <g className="animate-drift" style={{ animationDuration: '25s', animationDelay: '-8s' }}>
        <path d="M-60 220 Q-55 212 -50 220 Q-45 212 -40 220" stroke="#333" strokeWidth="1.5" fill="none" />
      </g>
      <g className="animate-drift" style={{ animationDuration: '22s', animationDelay: '-14s' }}>
        <path d="M-100 160 Q-95 152 -90 160 Q-85 152 -80 160" stroke="#555" strokeWidth="1.5" fill="none" />
      </g>
    </svg>
  );
}

/* ─── Colors: Rainbow gradient, floating paint splashes, paint bucket ─── */
function ColorsScene() {
  return (
    <svg viewBox="0 0 400 800" fill="none" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="rainbow-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF6B6B" />
          <stop offset="16%" stopColor="#FF8C42" />
          <stop offset="33%" stopColor="#FFE66D" />
          <stop offset="50%" stopColor="#6BCB77" />
          <stop offset="66%" stopColor="#4ECDC4" />
          <stop offset="83%" stopColor="#87CEEB" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
      </defs>
      <rect width="400" height="800" fill="url(#rainbow-sky)" opacity="0.4" />
      <rect width="400" height="800" fill="white" opacity="0.5" />

      {/* Floating paint splashes */}
      <g className="animate-float-gentle" style={{ animationDelay: '0s' }}>
        <circle cx="80" cy="150" r="30" fill="#FF6B6B" opacity="0.5" />
        <circle cx="95" cy="140" r="12" fill="#FF6B6B" opacity="0.4" />
        <circle cx="65" cy="165" r="8" fill="#FF6B6B" opacity="0.3" />
      </g>
      <g className="animate-float-gentle" style={{ animationDelay: '0.7s' }}>
        <circle cx="300" cy="220" r="28" fill="#4ECDC4" opacity="0.5" />
        <circle cx="320" cy="205" r="10" fill="#4ECDC4" opacity="0.4" />
        <circle cx="285" cy="235" r="7" fill="#4ECDC4" opacity="0.3" />
      </g>
      <g className="animate-float-gentle" style={{ animationDelay: '1.4s' }}>
        <circle cx="180" cy="340" r="35" fill="#FFE66D" opacity="0.5" />
        <circle cx="200" cy="325" r="14" fill="#FFE66D" opacity="0.4" />
        <circle cx="160" cy="355" r="9" fill="#FFE66D" opacity="0.3" />
      </g>
      <g className="animate-float-gentle" style={{ animationDelay: '2.1s' }}>
        <circle cx="100" cy="480" r="25" fill="#A78BFA" opacity="0.5" />
        <circle cx="115" cy="468" r="10" fill="#A78BFA" opacity="0.4" />
      </g>
      <g className="animate-float-gentle" style={{ animationDelay: '0.3s' }}>
        <circle cx="320" cy="420" r="32" fill="#6BCB77" opacity="0.45" />
        <circle cx="340" cy="405" r="12" fill="#6BCB77" opacity="0.35" />
      </g>
      <g className="animate-float-gentle" style={{ animationDelay: '1.8s' }}>
        <circle cx="200" cy="580" r="26" fill="#FF8C42" opacity="0.5" />
        <circle cx="215" cy="565" r="10" fill="#FF8C42" opacity="0.4" />
      </g>

      {/* Dripping paint drops */}
      {[
        { x: 60, y: 650, color: '#FF6B6B', d: '0s' },
        { x: 150, y: 680, color: '#FFE66D', d: '1s' },
        { x: 250, y: 660, color: '#4ECDC4', d: '2s' },
        { x: 340, y: 670, color: '#A78BFA', d: '0.5s' },
      ].map((drop, i) => (
        <g key={i} className="animate-float" style={{ animationDelay: drop.d }}>
          <path
            d={`M${drop.x} ${drop.y} Q${drop.x - 6} ${drop.y + 12} ${drop.x} ${drop.y + 18} Q${drop.x + 6} ${drop.y + 12} ${drop.x} ${drop.y}`}
            fill={drop.color}
            opacity="0.6"
          />
        </g>
      ))}

      {/* Paint bucket in corner */}
      <g transform="translate(30, 710)">
        <rect x="0" y="10" width="50" height="50" rx="5" fill="#8B8B8B" stroke="#666" strokeWidth="2" />
        <rect x="-3" y="5" width="56" height="10" rx="3" fill="#999" stroke="#666" strokeWidth="1.5" />
        {/* Paint overflow */}
        <path d="M5 10 Q15 -5 25 10" fill="#FF6B6B" />
        <path d="M25 10 Q35 -8 48 10" fill="#FF6B6B" />
        <rect x="5" y="0" width="40" height="12" rx="2" fill="#FF6B6B" opacity="0.8" />
        {/* Handle */}
        <path d="M10 5 Q25 -15 40 5" stroke="#666" strokeWidth="2.5" fill="none" />
      </g>
    </svg>
  );
}

/* ─── Shapes: Pastel purple-pink, floating geometric shapes ─── */
function ShapesScene() {
  return (
    <svg viewBox="0 0 400 800" fill="none" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="shapes-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8D5F5" />
          <stop offset="50%" stopColor="#F0D4E8" />
          <stop offset="100%" stopColor="#F5E0D0" />
        </linearGradient>
      </defs>
      <rect width="400" height="800" fill="url(#shapes-bg)" />

      {/* Floating circle */}
      <g className="animate-float-gentle" style={{ animationDelay: '0s' }}>
        <circle cx="100" cy="180" r="40" fill="#FF6B6B" opacity="0.5" stroke="#FF6B6B" strokeWidth="3" />
        <circle cx="100" cy="180" r="20" fill="#FF6B6B" opacity="0.2" />
      </g>

      {/* Floating triangle */}
      <g className="animate-float-gentle" style={{ animationDelay: '1s' }}>
        <polygon points="300,120 260,200 340,200" fill="#4ECDC4" opacity="0.5" stroke="#4ECDC4" strokeWidth="3" strokeLinejoin="round" />
      </g>

      {/* Floating square */}
      <g className="animate-float-gentle" style={{ animationDelay: '2s' }}>
        <rect x="60" y="350" width="70" height="70" rx="6" fill="#FFE66D" opacity="0.5" stroke="#FFE66D" strokeWidth="3" />
      </g>

      {/* Floating star */}
      <g className="animate-float-gentle" style={{ animationDelay: '0.5s' }}>
        <polygon
          points="300,350 312,380 345,385 320,405 327,438 300,420 273,438 280,405 255,385 288,380"
          fill="#A78BFA"
          opacity="0.5"
          stroke="#A78BFA"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </g>

      {/* Floating diamond */}
      <g className="animate-float-gentle" style={{ animationDelay: '1.5s' }}>
        <polygon points="200,480 235,530 200,580 165,530" fill="#FF8C42" opacity="0.5" stroke="#FF8C42" strokeWidth="3" strokeLinejoin="round" />
      </g>

      {/* Floating hexagon */}
      <g className="animate-float-gentle" style={{ animationDelay: '2.5s' }}>
        <polygon
          points="100,600 130,585 160,600 160,630 130,645 100,630"
          fill="#6BCB77"
          opacity="0.5"
          stroke="#6BCB77"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </g>

      {/* Small decorative shapes floating around */}
      {[
        { x: 50, y: 100, d: '0.3s' },
        { x: 350, y: 280, d: '1.2s' },
        { x: 200, y: 250, d: '0.8s' },
        { x: 70, y: 500, d: '1.8s' },
        { x: 330, y: 550, d: '2.2s' },
        { x: 180, y: 700, d: '0.6s' },
      ].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="6" fill={['#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA', '#FF8C42', '#6BCB77'][i]} opacity="0.3" className="animate-float" style={{ animationDelay: p.d }} />
      ))}

      {/* Floating pentagon */}
      <g className="animate-float-gentle" style={{ animationDelay: '1.8s' }}>
        <polygon
          points="320,680 345,700 335,728 305,728 295,700"
          fill="#87CEEB"
          opacity="0.45"
          stroke="#87CEEB"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

/* ─── Stories: Enchanted library, candle, sparkles, bookshelves ─── */
function StoriesScene() {
  return (
    <svg viewBox="0 0 400 800" fill="none" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="stories-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A0A2E" />
          <stop offset="50%" stopColor="#2D1B69" />
          <stop offset="100%" stopColor="#1A1A4E" />
        </linearGradient>
        <radialGradient id="candle-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#FFE66D" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FFE66D" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="800" fill="url(#stories-bg)" />

      {/* Bookshelf left */}
      <rect x="0" y="100" width="60" height="700" fill="#5D3A1A" />
      <rect x="0" y="100" width="55" height="15" fill="#7A4E28" />
      <rect x="0" y="250" width="55" height="12" fill="#7A4E28" />
      <rect x="0" y="400" width="55" height="12" fill="#7A4E28" />
      <rect x="0" y="550" width="55" height="12" fill="#7A4E28" />
      {/* Books on left shelf */}
      <rect x="5" y="115" width="12" height="130" rx="1" fill="#FF6B6B" />
      <rect x="20" y="125" width="10" height="120" rx="1" fill="#4ECDC4" />
      <rect x="33" y="118" width="14" height="127" rx="1" fill="#A78BFA" />
      <rect x="5" y="265" width="14" height="130" rx="1" fill="#FFE66D" />
      <rect x="22" y="270" width="11" height="125" rx="1" fill="#6BCB77" />
      <rect x="36" y="262" width="12" height="133" rx="1" fill="#FF8C42" />

      {/* Bookshelf right */}
      <rect x="340" y="80" width="60" height="720" fill="#5D3A1A" />
      <rect x="345" y="80" width="55" height="15" fill="#7A4E28" />
      <rect x="345" y="230" width="55" height="12" fill="#7A4E28" />
      <rect x="345" y="380" width="55" height="12" fill="#7A4E28" />
      <rect x="345" y="530" width="55" height="12" fill="#7A4E28" />
      {/* Books on right shelf */}
      <rect x="350" y="95" width="13" height="130" rx="1" fill="#87CEEB" />
      <rect x="366" y="100" width="10" height="125" rx="1" fill="#DDA0DD" />
      <rect x="379" y="92" width="14" height="133" rx="1" fill="#FF6B6B" />
      <rect x="350" y="245" width="12" height="130" rx="1" fill="#FFD93D" />
      <rect x="365" y="250" width="14" height="125" rx="1" fill="#4ECDC4" />
      <rect x="382" y="242" width="11" height="133" rx="1" fill="#A78BFA" />

      {/* Candle glow area */}
      <circle cx="200" cy="600" r="120" fill="url(#candle-glow)" />

      {/* Candle */}
      <rect x="193" y="610" width="14" height="50" rx="2" fill="#F5E6CA" />
      <ellipse cx="200" cy="610" rx="8" ry="3" fill="#E8D5B0" />
      {/* Wick */}
      <line x1="200" y1="610" x2="200" y2="600" stroke="#333" strokeWidth="1.5" />
      {/* Flame flickering */}
      <g className="animate-float" style={{ animationDuration: '1.5s' }}>
        <path d="M200 600 Q195 588 200 580 Q205 588 200 600" fill="#FFE66D" opacity="0.9" />
        <path d="M200 598 Q197 590 200 584 Q203 590 200 598" fill="#FF8C42" opacity="0.7" />
      </g>

      {/* Floating sparkle stars */}
      {[
        { x: 120, y: 200, d: '0s' },
        { x: 280, y: 150, d: '0.8s' },
        { x: 180, y: 350, d: '1.5s' },
        { x: 250, y: 450, d: '0.4s' },
        { x: 150, y: 500, d: '2s' },
        { x: 100, y: 650, d: '1.2s' },
        { x: 300, y: 600, d: '0.6s' },
        { x: 200, y: 250, d: '1.8s' },
      ].map((s, i) => (
        <g key={i} className="animate-sparkle" style={{ animationDelay: s.d }}>
          <line x1={s.x - 5} y1={s.y} x2={s.x + 5} y2={s.y} stroke="#FFE66D" strokeWidth="1.5" strokeLinecap="round" />
          <line x1={s.x} y1={s.y - 5} x2={s.x} y2={s.y + 5} stroke="#FFE66D" strokeWidth="1.5" strokeLinecap="round" />
          <line x1={s.x - 3} y1={s.y - 3} x2={s.x + 3} y2={s.y + 3} stroke="#FFE66D" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
          <line x1={s.x + 3} y1={s.y - 3} x2={s.x - 3} y2={s.y + 3} stroke="#FFE66D" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
        </g>
      ))}

      {/* Floor */}
      <rect x="0" y="680" width="400" height="120" fill="#2A1A0A" opacity="0.5" />
    </svg>
  );
}

/* ─── Play: Arcade gradient, confetti, game controller, flashing stars ─── */
function PlayScene() {
  return (
    <svg viewBox="0 0 400 800" fill="none" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="play-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2D1B69" />
          <stop offset="50%" stopColor="#6B2D7B" />
          <stop offset="100%" stopColor="#C2185B" />
        </linearGradient>
      </defs>
      <rect width="400" height="800" fill="url(#play-bg)" />

      {/* Confetti dots */}
      {[
        { x: 50, y: 80, c: '#FF6B6B', r: 5, d: '0s' },
        { x: 150, y: 120, c: '#FFE66D', r: 4, d: '0.5s' },
        { x: 280, y: 60, c: '#4ECDC4', r: 6, d: '1s' },
        { x: 370, y: 150, c: '#FF8C42', r: 4, d: '1.5s' },
        { x: 100, y: 250, c: '#6BCB77', r: 5, d: '0.3s' },
        { x: 320, y: 280, c: '#A78BFA', r: 4, d: '2s' },
        { x: 60, y: 400, c: '#FFE66D', r: 5, d: '0.8s' },
        { x: 200, y: 180, c: '#FF6B6B', r: 3, d: '1.2s' },
        { x: 340, y: 430, c: '#4ECDC4', r: 5, d: '0.6s' },
        { x: 180, y: 500, c: '#FF8C42', r: 4, d: '1.8s' },
        { x: 80, y: 560, c: '#A78BFA', r: 6, d: '2.2s' },
        { x: 300, y: 580, c: '#6BCB77', r: 4, d: '0.4s' },
      ].map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r={c.r} fill={c.c} opacity="0.5" className="animate-float" style={{ animationDelay: c.d }} />
      ))}

      {/* Flashing star-lights */}
      {[
        { x: 120, y: 300, d: '0s' },
        { x: 280, y: 200, d: '1s' },
        { x: 60, y: 180, d: '2s' },
        { x: 350, y: 350, d: '0.5s' },
        { x: 200, y: 400, d: '1.5s' },
      ].map((s, i) => (
        <g key={i} className="animate-sparkle" style={{ animationDelay: s.d }}>
          <polygon
            points={`${s.x},${s.y - 8} ${s.x + 3},${s.y - 2} ${s.x + 8},${s.y} ${s.x + 3},${s.y + 2} ${s.x},${s.y + 8} ${s.x - 3},${s.y + 2} ${s.x - 8},${s.y} ${s.x - 3},${s.y - 2}`}
            fill="white"
            opacity="0.6"
          />
        </g>
      ))}

      {/* Game controller silhouette in corner */}
      <g transform="translate(280, 660)" opacity="0.2">
        <rect x="0" y="15" width="80" height="45" rx="22" fill="white" />
        {/* D-pad */}
        <rect x="15" y="28" width="16" height="6" rx="1" fill="#2D1B69" />
        <rect x="20" y="23" width="6" height="16" rx="1" fill="#2D1B69" />
        {/* Buttons */}
        <circle cx="58" cy="30" r="4" fill="#2D1B69" />
        <circle cx="68" cy="36" r="4" fill="#2D1B69" />
        {/* Grips */}
        <rect x="5" y="50" width="18" height="25" rx="8" fill="white" />
        <rect x="57" y="50" width="18" height="25" rx="8" fill="white" />
      </g>

      {/* Neon line accents */}
      <line x1="0" y1="650" x2="400" y2="650" stroke="#FF6B6B" strokeWidth="1" opacity="0.2" />
      <line x1="0" y1="660" x2="400" y2="660" stroke="#4ECDC4" strokeWidth="1" opacity="0.15" />
    </svg>
  );
}

/* ─── Create: Art studio, paint splatters, hanging frames, brushes ─── */
function CreateScene() {
  return (
    <svg viewBox="0 0 400 800" fill="none" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="create-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF8C42" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#FFE66D" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FFF8F0" />
        </linearGradient>
      </defs>
      <rect width="400" height="800" fill="#FFF8F0" />
      <rect width="400" height="800" fill="url(#create-bg)" />

      {/* Wall paint splatters */}
      <circle cx="80" cy="120" r="25" fill="#FF6B6B" opacity="0.15" />
      <circle cx="90" cy="130" r="10" fill="#FF6B6B" opacity="0.1" />
      <circle cx="300" cy="200" r="30" fill="#4ECDC4" opacity="0.12" />
      <circle cx="315" cy="185" r="12" fill="#4ECDC4" opacity="0.08" />
      <circle cx="180" cy="100" r="20" fill="#A78BFA" opacity="0.1" />
      <circle cx="350" cy="400" r="22" fill="#FFE66D" opacity="0.15" />
      <circle cx="50" cy="350" r="18" fill="#6BCB77" opacity="0.12" />

      {/* Hanging artwork frame 1 */}
      <g className="animate-sway" style={{ animationDelay: '0s', transformOrigin: '120px 140px' }}>
        <line x1="120" y1="100" x2="120" y2="150" stroke="#8B8B8B" strokeWidth="1" />
        <rect x="85" y="150" width="70" height="55" rx="2" fill="white" stroke="#C8A96E" strokeWidth="3" />
        {/* Mini painting inside */}
        <rect x="92" y="157" width="56" height="41" fill="#87CEEB" />
        <ellipse cx="120" cy="188" rx="22" ry="10" fill="#6BCB77" />
        <circle cx="130" cy="168" r="8" fill="#FFE66D" />
      </g>

      {/* Hanging artwork frame 2 */}
      <g className="animate-sway" style={{ animationDelay: '0.8s', transformOrigin: '300px 100px' }}>
        <line x1="300" y1="60" x2="300" y2="110" stroke="#8B8B8B" strokeWidth="1" />
        <rect x="265" y="110" width="70" height="55" rx="2" fill="white" stroke="#C8A96E" strokeWidth="3" />
        {/* Abstract art inside */}
        <circle cx="285" cy="135" r="12" fill="#FF6B6B" opacity="0.7" />
        <circle cx="305" cy="140" r="10" fill="#4ECDC4" opacity="0.7" />
        <circle cx="295" cy="148" r="8" fill="#FFE66D" opacity="0.7" />
      </g>

      {/* Hanging artwork frame 3 */}
      <g className="animate-sway" style={{ animationDelay: '1.5s', transformOrigin: '200px 250px' }}>
        <line x1="200" y1="220" x2="200" y2="270" stroke="#8B8B8B" strokeWidth="1" />
        <rect x="165" y="270" width="70" height="90" rx="2" fill="white" stroke="#C8A96E" strokeWidth="3" />
        {/* Stick figure art */}
        <circle cx="200" cy="298" r="8" fill="none" stroke="#333" strokeWidth="1.5" />
        <line x1="200" y1="306" x2="200" y2="332" stroke="#333" strokeWidth="1.5" />
        <line x1="200" y1="315" x2="188" y2="325" stroke="#333" strokeWidth="1.5" />
        <line x1="200" y1="315" x2="212" y2="325" stroke="#333" strokeWidth="1.5" />
        <line x1="200" y1="332" x2="190" y2="348" stroke="#333" strokeWidth="1.5" />
        <line x1="200" y1="332" x2="210" y2="348" stroke="#333" strokeWidth="1.5" />
      </g>

      {/* Floor / desk area */}
      <rect x="0" y="650" width="400" height="150" fill="#D4A56A" opacity="0.3" />

      {/* Pencils at bottom */}
      <g transform="translate(100, 680)">
        <rect x="0" y="0" width="8" height="80" rx="1" fill="#FFE66D" transform="rotate(-8 4 40)" />
        <polygon points="0,80 4,95 8,80" fill="#F5C994" transform="rotate(-8 4 40)" />
        <rect x="15" y="5" width="8" height="75" rx="1" fill="#FF6B6B" transform="rotate(3 19 42)" />
        <polygon points="15,80 19,95 23,80" fill="#F5C994" transform="rotate(3 19 42)" />
      </g>

      {/* Paint brush */}
      <g transform="translate(260, 685)">
        <rect x="0" y="15" width="6" height="70" rx="2" fill="#C8A96E" transform="rotate(-12 3 50)" />
        <rect x="-2" y="10" width="10" height="12" rx="1" fill="#999" transform="rotate(-12 3 16)" />
        <ellipse cx="3" cy="7" rx="6" ry="8" fill="#4ECDC4" opacity="0.8" transform="rotate(-12 3 7)" />
      </g>
    </svg>
  );
}

/* ─── Wellbeing: Peach-lavender gradient, lamp, hearts, window, house ─── */
function WellbeingScene() {
  return (
    <svg viewBox="0 0 400 800" fill="none" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="wellbeing-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFDAB9" />
          <stop offset="50%" stopColor="#F0D4E8" />
          <stop offset="100%" stopColor="#E8D5F5" />
        </linearGradient>
        <radialGradient id="lamp-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#FFE66D" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#FFE66D" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="800" fill="url(#wellbeing-bg)" />

      {/* Gentle house outline */}
      <g opacity="0.15">
        <path d="M80 400 L200 300 L320 400 Z" fill="none" stroke="#8B6B6B" strokeWidth="3" />
        <rect x="110" y="400" width="180" height="200" fill="none" stroke="#8B6B6B" strokeWidth="3" />
        <rect x="170" y="500" width="60" height="100" rx="2" fill="none" stroke="#8B6B6B" strokeWidth="2" />
      </g>

      {/* Window with clouds */}
      <g transform="translate(250, 150)">
        <rect x="0" y="0" width="100" height="80" rx="8" fill="#87CEEB" opacity="0.4" stroke="#C8A96E" strokeWidth="3" />
        <line x1="50" y1="0" x2="50" y2="80" stroke="#C8A96E" strokeWidth="2" />
        <line x1="0" y1="40" x2="100" y2="40" stroke="#C8A96E" strokeWidth="2" />
        {/* Clouds through window */}
        <ellipse cx="30" cy="25" rx="15" ry="8" fill="white" opacity="0.6" />
        <ellipse cx="75" cy="60" rx="12" ry="6" fill="white" opacity="0.5" />
      </g>

      {/* Cozy lamp */}
      <g transform="translate(80, 300)">
        {/* Lamp glow */}
        <circle cx="0" cy="-10" r="80" fill="url(#lamp-glow)" />
        {/* Lampshade */}
        <path d="M-25 0 L-15 -40 L15 -40 L25 0 Z" fill="#FFD93D" opacity="0.8" stroke="#E8B800" strokeWidth="1.5" />
        {/* Lamp post */}
        <rect x="-3" y="0" width="6" height="80" fill="#C8A96E" />
        {/* Lamp base */}
        <ellipse cx="0" cy="80" rx="20" ry="5" fill="#C8A96E" />
      </g>

      {/* Floating hearts */}
      {[
        { x: 150, y: 200, s: 1, d: '0s', c: '#FF6B6B' },
        { x: 280, y: 350, s: 0.7, d: '0.8s', c: '#FF8C42' },
        { x: 100, y: 500, s: 0.9, d: '1.5s', c: '#FF6B6B' },
        { x: 320, y: 480, s: 0.6, d: '2s', c: '#A78BFA' },
        { x: 200, y: 600, s: 0.8, d: '0.4s', c: '#FF6B6B' },
      ].map((h, i) => (
        <g key={i} className="animate-float-gentle" style={{ animationDelay: h.d }}>
          <path
            d={`M${h.x} ${h.y + 5 * h.s} C${h.x - 10 * h.s} ${h.y - 8 * h.s} ${h.x - 18 * h.s} ${h.y + 5 * h.s} ${h.x} ${h.y + 18 * h.s} C${h.x + 18 * h.s} ${h.y + 5 * h.s} ${h.x + 10 * h.s} ${h.y - 8 * h.s} ${h.x} ${h.y + 5 * h.s}`}
            fill={h.c}
            opacity="0.3"
          />
        </g>
      ))}

      {/* Soft floor */}
      <rect x="0" y="680" width="400" height="120" fill="#E8D5F5" opacity="0.3" />
    </svg>
  );
}

/* ─── Explore: Adventure sky, mountains, compass, airplane trail ─── */
function ExploreScene() {
  return (
    <svg viewBox="0 0 400 800" fill="none" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="explore-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ECDC4" />
          <stop offset="40%" stopColor="#87CEEB" />
          <stop offset="100%" stopColor="#B5E8F7" />
        </linearGradient>
      </defs>
      <rect width="400" height="800" fill="url(#explore-sky)" />

      {/* Drifting clouds */}
      <g className="animate-drift" style={{ animationDuration: '50s' }} opacity="0.7">
        <ellipse cx="30" cy="120" rx="40" ry="18" fill="white" />
        <ellipse cx="60" cy="110" rx="30" ry="15" fill="white" />
      </g>
      <g className="animate-drift" style={{ animationDuration: '40s', animationDelay: '-15s' }} opacity="0.6">
        <ellipse cx="-50" cy="200" rx="35" ry="15" fill="white" />
        <ellipse cx="-25" cy="192" rx="25" ry="12" fill="white" />
      </g>

      {/* Tiny airplane with trail */}
      <g className="animate-drift" style={{ animationDuration: '30s', animationDelay: '-5s' }}>
        <g transform="translate(-80, 160)">
          {/* Trail */}
          <line x1="-60" y1="0" x2="0" y2="0" stroke="white" strokeWidth="1.5" opacity="0.4" strokeDasharray="4 4" />
          {/* Airplane body */}
          <path d="M0 0 L12 -3 L15 0 L12 3 Z" fill="white" opacity="0.7" />
          <path d="M5 -3 L10 -8 L12 -3" fill="white" opacity="0.6" />
          <path d="M5 3 L10 8 L12 3" fill="white" opacity="0.6" />
        </g>
      </g>

      {/* Mountain silhouettes */}
      <polygon points="0,550 80,380 160,550" fill="#5B8C5A" opacity="0.5" />
      <polygon points="100,550 200,340 300,550" fill="#4A7A4A" opacity="0.6" />
      <polygon points="220,550 320,400 400,550" fill="#5B8C5A" opacity="0.5" />
      {/* Snow caps */}
      <polygon points="195,345 200,340 205,345 202,350 198,350" fill="white" opacity="0.7" />
      <polygon points="76,384 80,380 84,384 82,388 78,388" fill="white" opacity="0.6" />

      {/* Ground */}
      <rect x="0" y="550" width="400" height="250" fill="#6BCB77" />
      <ellipse cx="200" cy="550" rx="250" ry="30" fill="#5AB85A" />

      {/* Path / trail */}
      <path d="M200 800 Q180 700 200 650 Q220 600 200 560" stroke="#C8A96E" strokeWidth="8" fill="none" opacity="0.3" strokeLinecap="round" />

      {/* Compass in corner */}
      <g transform="translate(340, 680)" opacity="0.3">
        <circle cx="0" cy="0" r="35" fill="white" stroke="#C8A96E" strokeWidth="2" />
        <circle cx="0" cy="0" r="30" fill="none" stroke="#C8A96E" strokeWidth="1" />
        {/* N/S/E/W */}
        <text x="-4" y="-18" fontSize="10" fill="#C8A96E" fontWeight="bold">N</text>
        <text x="-3" y="26" fontSize="10" fill="#C8A96E" fontWeight="bold">S</text>
        <text x="18" y="4" fontSize="10" fill="#C8A96E" fontWeight="bold">E</text>
        <text x="-26" y="4" fontSize="10" fill="#C8A96E" fontWeight="bold">W</text>
        {/* Needle */}
        <polygon points="0,-15 3,5 -3,5" fill="#FF6B6B" />
        <polygon points="0,15 3,-5 -3,-5" fill="#999" />
        <circle cx="0" cy="0" r="3" fill="#C8A96E" />
      </g>

      {/* Flag on mountain */}
      <g>
        <line x1="200" y1="340" x2="200" y2="320" stroke="#8B6B6B" strokeWidth="1.5" />
        <polygon points="200,320 215,325 200,330" fill="#FF6B6B" opacity="0.8" className="animate-sway" style={{ transformOrigin: '200px 325px' }} />
      </g>
    </svg>
  );
}

/* ─── Bedtime: Deep navy, moon, twinkling stars, sleeping clouds, fireflies ─── */
function BedtimeScene() {
  return (
    <svg viewBox="0 0 400 800" fill="none" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="bedtime-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0A0A2E" />
          <stop offset="40%" stopColor="#1A1A4E" />
          <stop offset="100%" stopColor="#2D1B69" />
        </linearGradient>
        <radialGradient id="moon-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#FFE66D" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#FFE66D" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="800" fill="url(#bedtime-sky)" />

      {/* Moon glow */}
      <circle cx="310" cy="120" r="100" fill="url(#moon-glow)" />
      {/* Moon */}
      <circle cx="310" cy="120" r="45" fill="#FFE66D" opacity="0.9" />
      <circle cx="330" cy="110" r="35" fill="#0A0A2E" opacity="0.9" />
      {/* Moon craters hint */}
      <circle cx="295" cy="115" r="5" fill="#E8D07A" opacity="0.3" />
      <circle cx="305" cy="135" r="3" fill="#E8D07A" opacity="0.25" />

      {/* Twinkling stars */}
      {[
        { x: 50, y: 80, r: 2, d: '0s' },
        { x: 150, y: 50, r: 1.5, d: '0.5s' },
        { x: 230, y: 30, r: 1.8, d: '1s' },
        { x: 100, y: 170, r: 1.2, d: '1.5s' },
        { x: 380, y: 200, r: 2, d: '2s' },
        { x: 30, y: 300, r: 1.5, d: '0.3s' },
        { x: 200, y: 250, r: 1, d: '0.8s' },
        { x: 350, y: 310, r: 1.8, d: '1.2s' },
        { x: 80, y: 400, r: 1.3, d: '1.8s' },
        { x: 260, y: 380, r: 1.5, d: '0.6s' },
        { x: 170, y: 450, r: 1, d: '2.2s' },
        { x: 390, y: 430, r: 1.6, d: '1.4s' },
      ].map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity="0.6" className="animate-sparkle" style={{ animationDelay: s.d }} />
      ))}

      {/* Sleeping clouds (with closed eyes) */}
      <g className="animate-float-gentle" style={{ animationDelay: '0s' }}>
        <g transform="translate(80, 280)">
          <ellipse cx="0" cy="0" rx="40" ry="18" fill="white" opacity="0.15" />
          <ellipse cx="25" cy="-8" rx="25" ry="14" fill="white" opacity="0.15" />
          <ellipse cx="-20" cy="-5" rx="20" ry="12" fill="white" opacity="0.15" />
          {/* Closed eyes - curved lines */}
          <path d="M-10 2 Q-6 5 -2 2" stroke="#8888AA" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M8 2 Q12 5 16 2" stroke="#8888AA" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
      </g>
      <g className="animate-float-gentle" style={{ animationDelay: '2s' }}>
        <g transform="translate(290, 400)">
          <ellipse cx="0" cy="0" rx="35" ry="16" fill="white" opacity="0.12" />
          <ellipse cx="20" cy="-7" rx="22" ry="12" fill="white" opacity="0.12" />
          <ellipse cx="-18" cy="-4" rx="18" ry="10" fill="white" opacity="0.12" />
          {/* Closed eyes */}
          <path d="M-8 1 Q-5 4 -2 1" stroke="#8888AA" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M6 1 Q9 4 12 1" stroke="#8888AA" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
      </g>

      {/* Gentle fireflies */}
      {[
        { x: 60, y: 520, d: '0s' },
        { x: 180, y: 580, d: '0.7s' },
        { x: 300, y: 540, d: '1.4s' },
        { x: 120, y: 650, d: '2.1s' },
        { x: 340, y: 620, d: '0.4s' },
        { x: 220, y: 700, d: '1.8s' },
        { x: 50, y: 720, d: '1.1s' },
        { x: 380, y: 680, d: '0.9s' },
      ].map((f, i) => (
        <g key={i} className="animate-sparkle" style={{ animationDelay: f.d }}>
          <circle cx={f.x} cy={f.y} r="3" fill="#FFE66D" opacity="0.4" />
          <circle cx={f.x} cy={f.y} r="6" fill="#FFE66D" opacity="0.1" />
        </g>
      ))}

      {/* Rolling hills at bottom */}
      <ellipse cx="100" cy="750" rx="200" ry="80" fill="#1A2A1A" opacity="0.4" />
      <ellipse cx="320" cy="760" rx="180" ry="70" fill="#1A2A1A" opacity="0.35" />
      <rect x="0" y="760" width="400" height="40" fill="#1A2A1A" opacity="0.4" />
    </svg>
  );
}

/* ─── Quiz: Game-show stage, spotlights, sweeping beams, confetti ─── */
function QuizScene() {
  return (
    <svg viewBox="0 0 400 800" fill="none" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="quiz-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A1A4E" />
          <stop offset="50%" stopColor="#2D1B69" />
          <stop offset="100%" stopColor="#3D2B79" />
        </linearGradient>
        <radialGradient id="spot1" cx="0.3" cy="0" r="0.8">
          <stop offset="0%" stopColor="#FFE66D" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#FFE66D" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="spot2" cx="0.7" cy="0" r="0.8">
          <stop offset="0%" stopColor="#4ECDC4" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#4ECDC4" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="800" fill="url(#quiz-bg)" />

      {/* Spotlight circles from top */}
      <rect width="400" height="400" fill="url(#spot1)" />
      <rect width="400" height="400" fill="url(#spot2)" />

      {/* Sweeping light beams */}
      <polygon points="120,0 60,400 180,400" fill="white" opacity="0.03" />
      <polygon points="280,0 220,400 340,400" fill="white" opacity="0.03" />
      <polygon points="200,0 150,350 250,350" fill="#FFE66D" opacity="0.02" />

      {/* Stage floor */}
      <rect x="0" y="620" width="400" height="180" fill="#2A1A5A" opacity="0.5" />
      <rect x="0" y="620" width="400" height="5" fill="#FFE66D" opacity="0.2" />

      {/* Stage lights at top */}
      {[60, 140, 200, 260, 340].map((x, i) => (
        <g key={i} className="animate-sparkle" style={{ animationDelay: `${i * 0.4}s` }}>
          <circle cx={x} cy="20" r="8" fill={['#FF6B6B', '#FFE66D', '#4ECDC4', '#A78BFA', '#FF8C42'][i]} opacity="0.5" />
          <circle cx={x} cy="20" r="12" fill={['#FF6B6B', '#FFE66D', '#4ECDC4', '#A78BFA', '#FF8C42'][i]} opacity="0.15" />
        </g>
      ))}

      {/* Confetti dots */}
      {[
        { x: 40, y: 100, c: '#FF6B6B', d: '0s' },
        { x: 130, y: 180, c: '#FFE66D', d: '0.5s' },
        { x: 260, y: 120, c: '#4ECDC4', d: '1s' },
        { x: 350, y: 200, c: '#A78BFA', d: '1.5s' },
        { x: 80, y: 300, c: '#6BCB77', d: '0.3s' },
        { x: 200, y: 280, c: '#FF8C42', d: '2s' },
        { x: 320, y: 350, c: '#FF6B6B', d: '0.8s' },
        { x: 160, y: 420, c: '#FFE66D', d: '1.2s' },
        { x: 50, y: 500, c: '#4ECDC4', d: '1.8s' },
        { x: 300, y: 480, c: '#A78BFA', d: '0.6s' },
      ].map((c, i) => (
        <circle key={i} cx={c.x} cy={c.y} r="4" fill={c.c} opacity="0.4" className="animate-float" style={{ animationDelay: c.d }} />
      ))}

      {/* Question mark silhouette */}
      <g transform="translate(200, 500)" opacity="0.08">
        <text x="-30" y="40" fontSize="100" fill="white" fontWeight="bold" fontFamily="sans-serif">?</text>
      </g>

      {/* Podium hint */}
      <rect x="150" y="640" width="100" height="60" rx="5" fill="#3D2B79" opacity="0.3" stroke="#FFE66D" strokeWidth="1" />
    </svg>
  );
}

/* ─── Rewards: Gold gradient, falling stars, trophy, sparkles, medals ─── */
function RewardsScene() {
  return (
    <svg viewBox="0 0 400 800" fill="none" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="rewards-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD93D" />
          <stop offset="50%" stopColor="#FF8C42" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#FFF8F0" />
        </linearGradient>
        <radialGradient id="trophy-glow" cx="0.5" cy="0.3" r="0.5">
          <stop offset="0%" stopColor="#FFD93D" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FFD93D" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="800" fill="url(#rewards-bg)" />

      {/* Sparkle effects */}
      {[
        { x: 80, y: 100, d: '0s' },
        { x: 300, y: 80, d: '0.5s' },
        { x: 180, y: 200, d: '1s' },
        { x: 350, y: 250, d: '1.5s' },
        { x: 60, y: 350, d: '2s' },
        { x: 250, y: 400, d: '0.3s' },
        { x: 150, y: 500, d: '0.8s' },
        { x: 330, y: 550, d: '1.2s' },
      ].map((s, i) => (
        <g key={i} className="animate-sparkle" style={{ animationDelay: s.d }}>
          <line x1={s.x - 6} y1={s.y} x2={s.x + 6} y2={s.y} stroke="#FFD93D" strokeWidth="2" strokeLinecap="round" />
          <line x1={s.x} y1={s.y - 6} x2={s.x} y2={s.y + 6} stroke="#FFD93D" strokeWidth="2" strokeLinecap="round" />
          <line x1={s.x - 4} y1={s.y - 4} x2={s.x + 4} y2={s.y + 4} stroke="#FFD93D" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
          <line x1={s.x + 4} y1={s.y - 4} x2={s.x - 4} y2={s.y + 4} stroke="#FFD93D" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
        </g>
      ))}

      {/* Falling star particles */}
      {[
        { x: 50, y: 150, d: '0s' },
        { x: 120, y: 280, d: '0.7s' },
        { x: 230, y: 130, d: '1.4s' },
        { x: 340, y: 300, d: '0.3s' },
        { x: 80, y: 450, d: '2s' },
        { x: 300, y: 480, d: '1.1s' },
        { x: 180, y: 350, d: '1.8s' },
      ].map((s, i) => (
        <g key={i} className="animate-float" style={{ animationDelay: s.d }}>
          <polygon
            points={`${s.x},${s.y - 8} ${s.x + 2},${s.y - 2} ${s.x + 8},${s.y - 2} ${s.x + 3},${s.y + 2} ${s.x + 5},${s.y + 8} ${s.x},${s.y + 4} ${s.x - 5},${s.y + 8} ${s.x - 3},${s.y + 2} ${s.x - 8},${s.y - 2} ${s.x - 2},${s.y - 2}`}
            fill="#FFD93D"
            opacity="0.4"
          />
        </g>
      ))}

      {/* Trophy silhouette in corner */}
      <g transform="translate(40, 600)" opacity="0.15">
        <circle cx="40" cy="10" r="60" fill="url(#trophy-glow)" />
        {/* Cup body */}
        <path d="M20 0 L20 50 Q40 70 60 50 L60 0 Z" fill="#FFD93D" />
        {/* Cup rim */}
        <rect x="15" y="-5" width="50" height="10" rx="3" fill="#E8B800" />
        {/* Handles */}
        <path d="M20 10 Q5 10 5 25 Q5 40 20 40" fill="none" stroke="#FFD93D" strokeWidth="5" />
        <path d="M60 10 Q75 10 75 25 Q75 40 60 40" fill="none" stroke="#FFD93D" strokeWidth="5" />
        {/* Base */}
        <rect x="30" y="50" width="20" height="15" fill="#E8B800" />
        <rect x="20" y="65" width="40" height="8" rx="3" fill="#FFD93D" />
      </g>

      {/* Medal/ribbon shapes */}
      <g transform="translate(300, 620)" opacity="0.12" className="animate-float-gentle" style={{ animationDelay: '0.5s' }}>
        {/* Ribbon */}
        <polygon points="0,-30 -15,-10 0,0" fill="#FF6B6B" />
        <polygon points="0,-30 15,-10 0,0" fill="#C94040" />
        {/* Medal circle */}
        <circle cx="0" cy="15" r="20" fill="#FFD93D" stroke="#E8B800" strokeWidth="2" />
        {/* Star on medal */}
        <polygon
          points="0,3 3,10 11,10 5,15 7,22 0,18 -7,22 -5,15 -11,10 -3,10"
          fill="#E8B800"
        />
      </g>

      {/* Second smaller medal */}
      <g transform="translate(340, 530)" opacity="0.08" className="animate-float-gentle" style={{ animationDelay: '1.5s' }}>
        <polygon points="0,-20 -10,-5 0,0" fill="#4ECDC4" />
        <polygon points="0,-20 10,-5 0,0" fill="#3AA8A0" />
        <circle cx="0" cy="12" r="14" fill="#FFD93D" stroke="#E8B800" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

/* ─── Theme resolver ─── */
const themeMap: Record<AnimatedBackgroundProps['theme'], React.FC> = {
  home: HomeScene,
  abc: AbcScene,
  numbers: NumbersScene,
  animals: AnimalsScene,
  colors: ColorsScene,
  shapes: ShapesScene,
  stories: StoriesScene,
  play: PlayScene,
  create: CreateScene,
  wellbeing: WellbeingScene,
  explore: ExploreScene,
  bedtime: BedtimeScene,
  quiz: QuizScene,
  rewards: RewardsScene,
};

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = React.memo(({ theme }) => {
  const Scene = themeMap[theme] || themeMap.home;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <Scene />
    </div>
  );
});

AnimatedBackground.displayName = 'AnimatedBackground';

export default AnimatedBackground;
