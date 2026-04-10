/**
 * SVG Scene Illustrations for Story Pages
 * Each illustration is a hand-crafted SVG scene replacing emoji-based illustrations.
 * Scenes are mapped by emoji key and render colorful, kid-friendly artwork.
 */
import { type ReactNode } from 'react';

interface SceneProps {
  className?: string;
}

// ── Shared helpers ────────────────────────────────────────────
const Sky = ({ night = false }: { night?: boolean }) => (
  <rect width="300" height="200" fill={night ? 'url(#nightSky)' : 'url(#daySky)'} />
);

const Ground = ({ color = '#6BCB77' }: { color?: string }) => (
  <ellipse cx="150" cy="210" rx="180" ry="40" fill={color} />
);

const Cloud = ({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <ellipse cx="0" cy="0" rx="25" ry="12" fill="white" opacity="0.9" />
    <ellipse cx="-15" cy="3" rx="18" ry="10" fill="white" opacity="0.85" />
    <ellipse cx="15" cy="3" rx="18" ry="10" fill="white" opacity="0.85" />
  </g>
);

const Star = ({ x, y, size = 4, fill = '#FFE66D' }: { x: number; y: number; size?: number; fill?: string }) => (
  <polygon
    points={`${x},${y - size} ${x + size * 0.3},${y - size * 0.3} ${x + size},${y - size * 0.2} ${x + size * 0.4},${y + size * 0.2} ${x + size * 0.6},${y + size} ${x},${y + size * 0.45} ${x - size * 0.6},${y + size} ${x - size * 0.4},${y + size * 0.2} ${x - size},${y - size * 0.2} ${x - size * 0.3},${y - size * 0.3}`}
    fill={fill}
  />
);

const Tree = ({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) => (
  <g transform={`translate(${x},${y}) scale(${scale})`}>
    <rect x="-4" y="0" width="8" height="25" rx="2" fill="#8B6914" />
    <ellipse cx="0" cy="-8" rx="20" ry="22" fill="#4CAF50" />
    <ellipse cx="-8" cy="-2" rx="14" ry="16" fill="#66BB6A" />
    <ellipse cx="8" cy="-4" rx="14" ry="16" fill="#43A047" />
  </g>
);

const Flower = ({ x, y, color = '#FF6B6B' }: { x: number; y: number; color?: string }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x="-1" y="0" width="2" height="12" fill="#4CAF50" />
    <circle cx="-4" cy="-2" r="4" fill={color} opacity="0.9" />
    <circle cx="4" cy="-2" r="4" fill={color} opacity="0.9" />
    <circle cx="0" cy="-5" r="4" fill={color} opacity="0.9" />
    <circle cx="-3" cy="2" r="4" fill={color} opacity="0.9" />
    <circle cx="3" cy="2" r="4" fill={color} opacity="0.9" />
    <circle cx="0" cy="0" r="3" fill="#FFE66D" />
  </g>
);

const Sun = ({ x = 250, y = 35 }: { x?: number; y?: number }) => (
  <g>
    <circle cx={x} cy={y} r="22" fill="#FFE66D" />
    <circle cx={x} cy={y} r="18" fill="#FFD93D" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
      <line
        key={angle}
        x1={x + Math.cos((angle * Math.PI) / 180) * 26}
        y1={y + Math.sin((angle * Math.PI) / 180) * 26}
        x2={x + Math.cos((angle * Math.PI) / 180) * 34}
        y2={y + Math.sin((angle * Math.PI) / 180) * 34}
        stroke="#FFE66D"
        strokeWidth="3"
        strokeLinecap="round"
      />
    ))}
  </g>
);

const Moon = ({ x = 240, y = 40, crescent = false }: { x?: number; y?: number; crescent?: boolean }) => (
  <g>
    <circle cx={x} cy={y} r="24" fill="#FFF9C4" />
    <circle cx={x} cy={y} r="22" fill="#FFE082" />
    {crescent && <circle cx={x + 8} cy={y - 4} r="20" fill="#1a1a4e" />}
    <circle cx={x - 6} cy={y - 4} r="3" fill="#FFD54F" opacity="0.4" />
    <circle cx={x + 4} cy={y + 6} r="2" fill="#FFD54F" opacity="0.3" />
  </g>
);

const Water = ({ y = 150 }: { y?: number }) => (
  <g>
    <rect x="0" y={y} width="300" height={200 - y + 20} fill="#81D4FA" opacity="0.6" />
    <ellipse cx="80" cy={y + 15} rx="30" ry="3" fill="white" opacity="0.3" />
    <ellipse cx="200" cy={y + 25} rx="25" ry="2" fill="white" opacity="0.25" />
    <ellipse cx="140" cy={y + 35} rx="20" ry="2" fill="white" opacity="0.2" />
  </g>
);

const House = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x},${y})`}>
    <rect x="-20" y="-25" width="40" height="30" rx="2" fill="#FFAB91" />
    <polygon points="-25,-25 0,-45 25,-25" fill="#EF5350" />
    <rect x="-6" y="-15" width="12" height="20" rx="1" fill="#8D6E63" />
    <rect x="10" y="-18" width="8" height="8" rx="1" fill="#BBDEFB" />
    <circle cx="4" cy="-5" r="1.5" fill="#FFD54F" />
  </g>
);

// ── Gradient defs shared across scenes ────────────────────────
function SharedDefs() {
  return (
    <defs>
      <linearGradient id="daySky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#87CEEB" />
        <stop offset="100%" stopColor="#B3E5FC" />
      </linearGradient>
      <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#1a1a4e" />
        <stop offset="60%" stopColor="#2d2b6b" />
        <stop offset="100%" stopColor="#3a3580" />
      </linearGradient>
      <linearGradient id="sunset" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FF8A65" />
        <stop offset="50%" stopColor="#FFB74D" />
        <stop offset="100%" stopColor="#FFE082" />
      </linearGradient>
      <linearGradient id="rainbow" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#FF6B6B" />
        <stop offset="17%" stopColor="#FF8C42" />
        <stop offset="33%" stopColor="#FFE66D" />
        <stop offset="50%" stopColor="#6BCB77" />
        <stop offset="67%" stopColor="#4ECDC4" />
        <stop offset="83%" stopColor="#7C9CFF" />
        <stop offset="100%" stopColor="#A78BFA" />
      </linearGradient>
      <radialGradient id="pondWater" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#4FC3F7" />
        <stop offset="100%" stopColor="#0288D1" />
      </radialGradient>
    </defs>
  );
}

// ── SCENE COMPONENTS ──────────────────────────────────────────

// Full Moon night scene
function SceneFullMoon() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <Sky night />
      <Star x={60} y={30} size={5} />
      <Star x={120} y={50} size={3} />
      <Star x={30} y={70} size={4} />
      <Star x={180} y={25} size={3} />
      <Star x={90} y={15} size={4} />
      <Moon x={230} y={50} />
      <Ground color="#2E4057" />
      <Tree x={50} y={170} scale={0.8} />
      <Tree x={240} y={175} scale={0.6} />
      <House x={150} y={178} />
    </svg>
  );
}

// Stars in night sky
function SceneStars() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <Sky night />
      {[
        { x: 40, y: 30, s: 6 }, { x: 90, y: 50, s: 4 }, { x: 140, y: 20, s: 5 },
        { x: 200, y: 40, s: 7 }, { x: 250, y: 60, s: 4 }, { x: 70, y: 80, s: 5 },
        { x: 160, y: 70, s: 3 }, { x: 220, y: 90, s: 5 }, { x: 110, y: 100, s: 4 },
        { x: 30, y: 110, s: 3 }, { x: 270, y: 30, s: 4 }, { x: 180, y: 110, s: 6 },
      ].map((s, i) => (
        <Star key={i} x={s.x} y={s.y} size={s.s} />
      ))}
      <Moon x={150} y={130} crescent />
      <Ground color="#1a3a2a" />
    </svg>
  );
}

// Tree scene (night)
function SceneTreeNight() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <Sky night />
      <Star x={80} y={25} size={4} />
      <Star x={200} y={35} size={3} />
      <Star x={260} y={20} size={5} />
      <Moon x={50} y={40} crescent />
      <Ground color="#2E4057" />
      <Tree x={150} y={168} scale={1.4} />
      <Tree x={60} y={175} scale={0.7} />
      <Tree x={240} y={175} scale={0.9} />
    </svg>
  );
}

// Bird in nest scene
function SceneBirdNest() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <Sky night />
      <Star x={50} y={20} size={4} />
      <Star x={250} y={30} size={3} />
      <Moon x={220} y={40} crescent />
      <Ground color="#2E4057" />
      <Tree x={150} y={165} scale={1.5} />
      {/* Nest */}
      <ellipse cx="160" cy="118" rx="18" ry="8" fill="#8D6E63" />
      <path d="M143,118 Q150,110 160,112 Q170,110 177,118" fill="#A1887F" stroke="#795548" strokeWidth="1" />
      {/* Bird */}
      <ellipse cx="155" cy="108" rx="8" ry="7" fill="#90A4AE" />
      <circle cx="152" cy="105" r="5" fill="#B0BEC5" />
      <circle cx="150" cy="104" r="1.5" fill="#333" />
      <polygon points="146,106 140,105 146,108" fill="#FF8C42" />
    </svg>
  );
}

// Sleeping scene
function SceneSleeping() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <Sky night />
      <Star x={80} y={20} size={4} />
      <Star x={200} y={30} size={5} />
      <Star x={130} y={50} size={3} />
      <Moon x={240} y={40} />
      {/* Bed */}
      <rect x="80" y="130" width="140" height="50" rx="8" fill="#7E57C2" />
      <rect x="75" y="125" width="150" height="15" rx="6" fill="#9575CD" />
      {/* Blanket */}
      <rect x="85" y="130" width="130" height="35" rx="5" fill="#CE93D8" />
      {/* Pillow */}
      <ellipse cx="120" cy="130" rx="30" ry="10" fill="white" />
      {/* Sleeping child */}
      <circle cx="120" cy="120" r="15" fill="#FFCC80" />
      <path d="M113,123 Q120,127 127,123" stroke="#333" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Z letters */}
      <text x="170" y="100" fill="#B39DDB" fontSize="18" fontWeight="bold" opacity="0.7">z</text>
      <text x="185" y="85" fill="#B39DDB" fontSize="14" fontWeight="bold" opacity="0.5">z</text>
      <text x="195" y="72" fill="#B39DDB" fontSize="10" fontWeight="bold" opacity="0.3">z</text>
    </svg>
  );
}

// Duck on pond
function SceneDuck() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <Sky />
      <Cloud x={60} y={30} />
      <Cloud x={200} y={45} scale={0.7} />
      <Sun />
      {/* Pond */}
      <ellipse cx="150" cy="160" rx="130" ry="45" fill="url(#pondWater)" />
      <ellipse cx="120" cy="155" rx="25" ry="3" fill="white" opacity="0.3" />
      <ellipse cx="190" cy="165" rx="20" ry="2" fill="white" opacity="0.25" />
      {/* Reeds */}
      <line x1="35" y1="180" x2="32" y2="140" stroke="#4CAF50" strokeWidth="2" />
      <ellipse cx="32" cy="138" rx="4" ry="8" fill="#66BB6A" />
      <line x1="270" y1="175" x2="273" y2="135" stroke="#4CAF50" strokeWidth="2" />
      <ellipse cx="273" cy="133" rx="4" ry="8" fill="#66BB6A" />
      {/* Duck */}
      <ellipse cx="150" cy="148" rx="22" ry="14" fill="#FFE082" />
      <circle cx="137" cy="135" r="12" fill="#FFE082" />
      <circle cx="133" cy="132" r="2" fill="#333" />
      <polygon points="125,136 115,134 125,140" fill="#FF8C42" />
      {/* Wing */}
      <ellipse cx="158" cy="144" rx="10" ry="8" fill="#FFD54F" />
    </svg>
  );
}

// Water splash
function SceneSplash() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <Sky />
      <Cloud x={80} y={25} />
      <Sun />
      <ellipse cx="150" cy="160" rx="130" ry="45" fill="url(#pondWater)" />
      {/* Splash drops */}
      {[
        { x: 130, y: 110 }, { x: 150, y: 100 }, { x: 170, y: 108 },
        { x: 140, y: 95 }, { x: 160, y: 92 }, { x: 120, y: 118 }, { x: 180, y: 115 },
      ].map((d, i) => (
        <ellipse key={i} cx={d.x} cy={d.y} rx="4" ry="7" fill="#4FC3F7" opacity="0.7" />
      ))}
      {/* Duck splashing */}
      <ellipse cx="150" cy="145" rx="20" ry="12" fill="#FFE082" />
      <circle cx="138" cy="133" r="10" fill="#FFE082" />
      <circle cx="134" cy="131" r="1.5" fill="#333" />
      <polygon points="128,134 120,132 128,137" fill="#FF8C42" />
    </svg>
  );
}

// Frog on lily pad
function SceneFrog() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <Sky />
      <Cloud x={70} y={30} />
      <Cloud x={220} y={40} scale={0.6} />
      <Sun />
      <ellipse cx="150" cy="160" rx="130" ry="45" fill="url(#pondWater)" />
      {/* Lily pad */}
      <ellipse cx="160" cy="148" rx="28" ry="12" fill="#4CAF50" />
      <line x1="160" y1="136" x2="160" y2="148" stroke="#388E3C" strokeWidth="1" />
      {/* Frog */}
      <ellipse cx="160" cy="132" rx="16" ry="12" fill="#66BB6A" />
      <circle cx="152" cy="122" r="6" fill="#81C784" />
      <circle cx="168" cy="122" r="6" fill="#81C784" />
      <circle cx="152" cy="120" r="3" fill="white" />
      <circle cx="168" cy="120" r="3" fill="white" />
      <circle cx="152" cy="121" r="1.5" fill="#333" />
      <circle cx="168" cy="121" r="1.5" fill="#333" />
      <path d="M155,130 Q160,134 165,130" stroke="#333" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// Sunny day
function SceneSunny() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <Sky />
      <Cloud x={60} y={40} />
      <Cloud x={200} y={30} scale={0.8} />
      <Sun x={150} y={50} />
      <Ground />
      <Tree x={50} y={170} scale={0.8} />
      <Tree x={250} y={172} scale={0.7} />
      <Flower x={100} y={178} color="#FF6B6B" />
      <Flower x={130} y={182} color="#FFE66D" />
      <Flower x={180} y={180} color="#A78BFA" />
      <Flower x={210} y={178} color="#FF8C42" />
    </svg>
  );
}

// Teddy bear
function SceneTeddyBear() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <rect width="300" height="200" fill="#FFF3E0" />
      {/* Teddy bear */}
      <g transform="translate(150,110)">
        {/* Ears */}
        <circle cx="-25" cy="-40" r="14" fill="#A1887F" />
        <circle cx="-25" cy="-40" r="8" fill="#BCAAA4" />
        <circle cx="25" cy="-40" r="14" fill="#A1887F" />
        <circle cx="25" cy="-40" r="8" fill="#BCAAA4" />
        {/* Body */}
        <ellipse cx="0" cy="20" rx="30" ry="35" fill="#A1887F" />
        <ellipse cx="0" cy="25" rx="22" ry="25" fill="#BCAAA4" />
        {/* Head */}
        <circle cx="0" cy="-20" r="28" fill="#A1887F" />
        {/* Face */}
        <ellipse cx="0" cy="-10" rx="16" ry="12" fill="#BCAAA4" />
        <circle cx="-10" cy="-25" r="4" fill="#333" />
        <circle cx="10" cy="-25" r="4" fill="#333" />
        <circle cx="-10" cy="-26" r="1.5" fill="white" />
        <circle cx="10" cy="-26" r="1.5" fill="white" />
        <ellipse cx="0" cy="-15" rx="5" ry="3" fill="#795548" />
        <path d="M-6,-10 Q0,-5 6,-10" stroke="#795548" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Arms */}
        <ellipse cx="-32" cy="10" rx="10" ry="18" fill="#A1887F" transform="rotate(-15,-32,10)" />
        <ellipse cx="32" cy="10" rx="10" ry="18" fill="#A1887F" transform="rotate(15,32,10)" />
        {/* Feet */}
        <ellipse cx="-14" cy="55" rx="14" ry="8" fill="#A1887F" />
        <ellipse cx="14" cy="55" rx="14" ry="8" fill="#A1887F" />
      </g>
    </svg>
  );
}

// Hug scene
function SceneHug() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <rect width="300" height="200" fill="#FCE4EC" />
      {/* Hearts */}
      {[
        { x: 60, y: 30, s: 0.6 }, { x: 240, y: 40, s: 0.5 },
        { x: 150, y: 20, s: 0.8 }, { x: 100, y: 55, s: 0.4 }, { x: 210, y: 60, s: 0.45 },
      ].map((h, i) => (
        <g key={i} transform={`translate(${h.x},${h.y}) scale(${h.s})`}>
          <path d="M0,-10 C-10,-20 -25,-10 -15,5 L0,18 L15,5 C25,-10 10,-20 0,-10Z" fill="#FF6B6B" opacity="0.3" />
        </g>
      ))}
      {/* Teddy */}
      <g transform="translate(120,120) scale(0.7)">
        <circle cx="-15" cy="-30" r="8" fill="#A1887F" />
        <circle cx="15" cy="-30" r="8" fill="#A1887F" />
        <circle cx="0" cy="-15" r="20" fill="#A1887F" />
        <ellipse cx="0" cy="15" rx="18" ry="22" fill="#A1887F" />
        <circle cx="-6" cy="-18" r="2.5" fill="#333" />
        <circle cx="6" cy="-18" r="2.5" fill="#333" />
        <ellipse cx="0" cy="-10" rx="3" ry="2" fill="#795548" />
      </g>
      {/* Bunny */}
      <g transform="translate(180,120) scale(0.7)">
        <ellipse cx="-8" cy="-50" rx="6" ry="18" fill="#E0E0E0" />
        <ellipse cx="8" cy="-50" rx="6" ry="18" fill="#E0E0E0" />
        <ellipse cx="-8" cy="-50" rx="3" ry="14" fill="#F8BBD0" />
        <ellipse cx="8" cy="-50" rx="3" ry="14" fill="#F8BBD0" />
        <circle cx="0" cy="-18" r="18" fill="#F5F5F5" />
        <ellipse cx="0" cy="12" rx="16" ry="22" fill="#F5F5F5" />
        <circle cx="-6" cy="-20" r="2.5" fill="#333" />
        <circle cx="6" cy="-20" r="2.5" fill="#333" />
        <ellipse cx="0" cy="-13" rx="3" ry="2" fill="#F8BBD0" />
      </g>
      {/* Hug arms overlap */}
      <path d="M135,120 Q150,105 165,120" stroke="#A1887F" strokeWidth="6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// Bunny
function SceneBunny() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <Sky />
      <Cloud x={80} y={30} />
      <Sun />
      <Ground />
      <Flower x={60} y={178} color="#FF6B6B" />
      <Flower x={230} y={180} color="#FFE66D" />
      {/* Bunny */}
      <g transform="translate(150,145)">
        <ellipse cx="-10" cy="-55" rx="8" ry="22" fill="#F5F5F5" />
        <ellipse cx="10" cy="-55" rx="8" ry="22" fill="#F5F5F5" />
        <ellipse cx="-10" cy="-55" rx="4" ry="16" fill="#F8BBD0" />
        <ellipse cx="10" cy="-55" rx="4" ry="16" fill="#F8BBD0" />
        <circle cx="0" cy="-22" r="22" fill="#F5F5F5" />
        <ellipse cx="0" cy="10" rx="20" ry="28" fill="#F5F5F5" />
        <circle cx="-8" cy="-26" r="3" fill="#333" />
        <circle cx="8" cy="-26" r="3" fill="#333" />
        <circle cx="-8" cy="-27" r="1" fill="white" />
        <circle cx="8" cy="-27" r="1" fill="white" />
        <ellipse cx="0" cy="-18" rx="4" ry="3" fill="#F8BBD0" />
        <path d="M-5,-14 Q0,-10 5,-14" stroke="#666" strokeWidth="1" fill="none" />
        <circle cx="-14" cy="-14" r="5" fill="#F8BBD0" opacity="0.4" />
        <circle cx="14" cy="-14" r="5" fill="#F8BBD0" opacity="0.4" />
        <ellipse cx="-14" cy="30" rx="8" ry="5" fill="#F5F5F5" />
        <ellipse cx="14" cy="30" rx="8" ry="5" fill="#F5F5F5" />
      </g>
    </svg>
  );
}

// Cookie/sharing scene
function SceneCookies() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <rect width="300" height="200" fill="#FFF8E1" />
      {/* Table */}
      <rect x="60" y="110" width="180" height="8" rx="3" fill="#A1887F" />
      <rect x="80" y="118" width="8" height="60" fill="#8D6E63" />
      <rect x="212" y="118" width="8" height="60" fill="#8D6E63" />
      {/* Plate */}
      <ellipse cx="150" cy="104" rx="40" ry="10" fill="#E0E0E0" />
      <ellipse cx="150" cy="102" rx="35" ry="8" fill="#EEEEEE" />
      {/* Cookies */}
      {[
        { x: 138, y: 96 }, { x: 155, y: 94 }, { x: 148, y: 98 }, { x: 162, y: 97 },
      ].map((c, i) => (
        <g key={i}>
          <circle cx={c.x} cy={c.y} r="8" fill="#D7A86E" />
          <circle cx={c.x - 2} cy={c.y - 2} r="1.5" fill="#5D4037" />
          <circle cx={c.x + 3} cy={c.y + 1} r="1.5" fill="#5D4037" />
          <circle cx={c.x} cy={c.y + 3} r="1.2" fill="#5D4037" />
        </g>
      ))}
    </svg>
  );
}

// Heart / love
function SceneHeart() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <rect width="300" height="200" fill="#FFF0F5" />
      {/* Big heart */}
      <g transform="translate(150,95) scale(2.5)">
        <path d="M0,-10 C-10,-25 -30,-15 -20,0 L0,20 L20,0 C30,-15 10,-25 0,-10Z" fill="#FF6B6B" />
        <path d="M-5,-10 C-12,-20 -25,-12 -17,-2" fill="none" stroke="white" strokeWidth="2" opacity="0.4" strokeLinecap="round" />
      </g>
      {/* Small hearts */}
      {[
        { x: 60, y: 40, s: 0.8 }, { x: 240, y: 50, s: 0.6 },
        { x: 80, y: 150, s: 0.5 }, { x: 220, y: 140, s: 0.7 },
      ].map((h, i) => (
        <g key={i} transform={`translate(${h.x},${h.y}) scale(${h.s})`}>
          <path d="M0,-5 C-5,-12 -15,-7 -10,2 L0,10 L10,2 C15,-7 5,-12 0,-5Z" fill="#F48FB1" opacity="0.5" />
        </g>
      ))}
    </svg>
  );
}

// Magic door
function SceneDoor() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <Sky />
      <Ground color="#5D4037" />
      {/* Big oak tree */}
      <rect x="120" y="60" width="60" height="130" rx="8" fill="#5D4037" />
      <ellipse cx="150" cy="50" rx="80" ry="55" fill="#388E3C" />
      <ellipse cx="110" cy="60" rx="50" ry="40" fill="#43A047" />
      <ellipse cx="190" cy="55" rx="50" ry="40" fill="#2E7D32" />
      {/* Tiny door */}
      <rect x="138" y="135" width="24" height="35" rx="12" fill="#8D6E63" />
      <rect x="140" y="137" width="20" height="31" rx="10" fill="#FFCC80" />
      <circle cx="155" cy="155" r="2" fill="#FFD54F" />
      {/* Light from door */}
      <ellipse cx="150" cy="170" rx="20" ry="5" fill="#FFE082" opacity="0.4" />
      {/* Sparkles */}
      <Star x={135} y={128} size={3} fill="#FFE66D" />
      <Star x={168} y={132} size={2} fill="#FFE66D" />
      <Star x={150} y={122} size={4} fill="#FFD93D" />
    </svg>
  );
}

// Magic garden with flowers
function SceneGarden() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <Sky />
      <Cloud x={70} y={25} scale={0.8} />
      <Sun />
      <Ground />
      {/* Flowers everywhere */}
      <Flower x={40} y={172} color="#FF6B6B" />
      <Flower x={70} y={178} color="#A78BFA" />
      <Flower x={100} y={170} color="#FF8C42" />
      <Flower x={130} y={176} color="#FFE66D" />
      <Flower x={160} y={172} color="#4ECDC4" />
      <Flower x={190} y={178} color="#FF6B6B" />
      <Flower x={220} y={174} color="#A78BFA" />
      <Flower x={250} y={176} color="#FFE66D" />
      {/* Sunflower big */}
      <g transform="translate(150,148)">
        <rect x="-2" y="0" width="4" height="30" fill="#4CAF50" />
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => (
          <ellipse
            key={a}
            cx={Math.cos(a * Math.PI / 180) * 14}
            cy={Math.sin(a * Math.PI / 180) * 14 - 8}
            rx="8" ry="4"
            fill="#FFE66D"
            transform={`rotate(${a},${Math.cos(a * Math.PI / 180) * 14},${Math.sin(a * Math.PI / 180) * 14 - 8})`}
          />
        ))}
        <circle cx="0" cy="-8" r="10" fill="#8D6E63" />
      </g>
      {/* Sparkles */}
      <Star x={80} y={140} size={3} fill="#FFE66D" />
      <Star x={220} y={138} size={4} fill="#FFD93D" />
      <Star x={150} y={120} size={3} fill="#FFE66D" />
    </svg>
  );
}

// Cherry blossom / flowers dancing
function SceneBlossoms() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <Sky />
      <Sun />
      <Ground />
      {/* Blossom petals floating */}
      {[
        { x: 50, y: 40, r: 6 }, { x: 100, y: 60, r: 5 }, { x: 180, y: 35, r: 7 },
        { x: 230, y: 55, r: 5 }, { x: 140, y: 80, r: 6 }, { x: 70, y: 90, r: 4 },
        { x: 210, y: 85, r: 5 }, { x: 120, y: 45, r: 4 }, { x: 260, y: 70, r: 5 },
      ].map((p, i) => (
        <g key={i} transform={`translate(${p.x},${p.y}) rotate(${i * 37})`}>
          <ellipse cx="0" cy="-4" rx={p.r * 0.6} ry={p.r} fill="#F8BBD0" opacity="0.7" />
          <ellipse cx="4" cy="0" rx={p.r} ry={p.r * 0.6} fill="#F48FB1" opacity="0.6" />
        </g>
      ))}
      <Flower x={80} y={175} color="#F48FB1" />
      <Flower x={150} y={172} color="#CE93D8" />
      <Flower x={220} y={178} color="#F48FB1" />
    </svg>
  );
}

// Butterfly
function SceneButterfly() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <Sky />
      <Cloud x={60} y={25} scale={0.7} />
      <Sun />
      <Ground />
      <Flower x={100} y={175} color="#FF6B6B" />
      <Flower x={200} y={178} color="#A78BFA" />
      {/* Butterfly */}
      <g transform="translate(150,90)">
        {/* Wings */}
        <ellipse cx="-20" cy="-8" rx="22" ry="18" fill="#FF6B6B" opacity="0.8" />
        <ellipse cx="20" cy="-8" rx="22" ry="18" fill="#4ECDC4" opacity="0.8" />
        <ellipse cx="-18" cy="10" rx="16" ry="14" fill="#FFE66D" opacity="0.8" />
        <ellipse cx="18" cy="10" rx="16" ry="14" fill="#A78BFA" opacity="0.8" />
        {/* Wing patterns */}
        <circle cx="-20" cy="-8" r="6" fill="white" opacity="0.4" />
        <circle cx="20" cy="-8" r="6" fill="white" opacity="0.4" />
        {/* Body */}
        <ellipse cx="0" cy="0" rx="3" ry="18" fill="#333" />
        {/* Antennae */}
        <line x1="-2" y1="-18" x2="-10" y2="-30" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="2" y1="-18" x2="10" y2="-30" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="-10" cy="-30" r="2" fill="#333" />
        <circle cx="10" cy="-30" r="2" fill="#333" />
      </g>
    </svg>
  );
}

// Sparkle / magic
function SceneSparkle() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <rect width="300" height="200" fill="#EDE7F6" />
      {[
        { x: 50, y: 40, s: 8 }, { x: 150, y: 30, s: 10 }, { x: 250, y: 50, s: 7 },
        { x: 80, y: 100, s: 9 }, { x: 200, y: 90, s: 8 }, { x: 120, y: 150, s: 6 },
        { x: 220, y: 140, s: 7 }, { x: 60, y: 160, s: 5 }, { x: 180, y: 160, s: 8 },
        { x: 150, y: 100, s: 12 }, { x: 100, y: 70, s: 6 }, { x: 240, y: 120, s: 5 },
      ].map((s, i) => (
        <Star key={i} x={s.x} y={s.y} size={s.s} fill={['#FFE66D', '#FFD93D', '#A78BFA', '#4ECDC4'][i % 4]} />
      ))}
    </svg>
  );
}

// Smiley / happy
function SceneHappy() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <Sky />
      <Sun x={150} y={45} />
      <Cloud x={50} y={25} scale={0.6} />
      <Cloud x={240} y={35} scale={0.7} />
      <Ground />
      <Flower x={70} y={175} color="#FF6B6B" />
      <Flower x={130} y={180} color="#FFE66D" />
      <Flower x={190} y={178} color="#4ECDC4" />
      <Flower x={240} y={175} color="#A78BFA" />
      <Tree x={40} y={170} scale={0.7} />
      <Tree x={260} y={172} scale={0.6} />
    </svg>
  );
}

// Rain scene
function SceneRain() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <rect width="300" height="200" fill="#B0BEC5" />
      {/* Dark clouds */}
      <ellipse cx="80" cy="40" rx="50" ry="25" fill="#78909C" />
      <ellipse cx="150" cy="35" rx="60" ry="28" fill="#607D8B" />
      <ellipse cx="220" cy="42" rx="50" ry="24" fill="#78909C" />
      <ellipse cx="120" cy="30" rx="40" ry="22" fill="#546E7A" />
      <ellipse cx="190" cy="32" rx="45" ry="22" fill="#546E7A" />
      {/* Rain drops */}
      {Array.from({ length: 20 }).map((_, i) => (
        <line
          key={i}
          x1={15 + i * 15}
          y1={70 + (i % 4) * 15}
          x2={12 + i * 15}
          y2={85 + (i % 4) * 15}
          stroke="#4FC3F7"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
        />
      ))}
      <Ground color="#5D8A5D" />
      {/* Puddles */}
      <ellipse cx="100" cy="185" rx="25" ry="5" fill="#4FC3F7" opacity="0.4" />
      <ellipse cx="200" cy="188" rx="20" ry="4" fill="#4FC3F7" opacity="0.35" />
    </svg>
  );
}

// Tulip / flower growing
function SceneTulip() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <Sky />
      <Cloud x={200} y={30} scale={0.7} />
      <Sun />
      <Ground />
      {/* Big tulips */}
      {[
        { x: 80, y: 140, color: '#FF6B6B' },
        { x: 120, y: 145, color: '#FFE66D' },
        { x: 160, y: 138, color: '#FF8C42' },
        { x: 200, y: 142, color: '#A78BFA' },
        { x: 240, y: 144, color: '#FF6B6B' },
      ].map((t, i) => (
        <g key={i} transform={`translate(${t.x},${t.y})`}>
          <rect x="-2" y="0" width="4" height="35" fill="#4CAF50" />
          <ellipse cx="-5" cy="15" rx="10" ry="4" fill="#66BB6A" transform="rotate(-30,-5,15)" />
          <path d={`M0,-8 C-12,-8 -14,5 -8,8 L0,2 L8,8 C14,5 12,-8 0,-8Z`} fill={t.color} />
        </g>
      ))}
    </svg>
  );
}

// Rainbow
function SceneRainbow() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <Sky />
      <Cloud x={40} y={30} scale={0.8} />
      <Cloud x={250} y={35} scale={0.6} />
      {/* Rainbow arcs */}
      {[
        { r: 110, color: '#FF6B6B' }, { r: 102, color: '#FF8C42' },
        { r: 94, color: '#FFE66D' }, { r: 86, color: '#6BCB77' },
        { r: 78, color: '#4ECDC4' }, { r: 70, color: '#7C9CFF' },
        { r: 62, color: '#A78BFA' },
      ].map((arc, i) => (
        <path
          key={i}
          d={`M${150 - arc.r},180 A${arc.r},${arc.r} 0 0,1 ${150 + arc.r},180`}
          fill="none"
          stroke={arc.color}
          strokeWidth="7"
          opacity="0.8"
        />
      ))}
      <Ground />
    </svg>
  );
}

// Paint palette / art
function ScenePalette() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <rect width="300" height="200" fill="#FFF8E1" />
      {/* Palette */}
      <ellipse cx="150" cy="110" rx="90" ry="65" fill="#F5E6CA" />
      <ellipse cx="130" cy="130" rx="20" ry="18" fill="#F5E6CA" stroke="#DDD" strokeWidth="1" />
      {/* Paint blobs */}
      <circle cx="100" cy="75" r="12" fill="#FF6B6B" />
      <circle cx="135" cy="65" r="11" fill="#FF8C42" />
      <circle cx="170" cy="68" r="12" fill="#FFE66D" />
      <circle cx="200" cy="80" r="11" fill="#6BCB77" />
      <circle cx="210" cy="110" r="10" fill="#4ECDC4" />
      <circle cx="195" cy="138" r="11" fill="#A78BFA" />
      {/* Paintbrush */}
      <rect x="85" y="150" width="100" height="5" rx="2" fill="#8D6E63" transform="rotate(-25,135,152)" />
      <rect x="75" y="148" width="15" height="10" rx="2" fill="#FFE66D" transform="rotate(-25,82,153)" />
    </svg>
  );
}

// Fox
function SceneFox() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <Sky />
      <Cloud x={80} y={30} />
      <Sun />
      <Ground />
      <Tree x={50} y={170} scale={0.8} />
      <Tree x={250} y={172} scale={0.7} />
      {/* Fox */}
      <g transform="translate(150,150)">
        <ellipse cx="0" cy="0" rx="22" ry="15" fill="#FF8C42" />
        <ellipse cx="0" cy="4" rx="14" ry="10" fill="#FFCC80" />
        <circle cx="-5" cy="-18" r="14" fill="#FF8C42" />
        {/* Ears */}
        <polygon points="-15,-30 -10,-18 -20,-18" fill="#FF8C42" />
        <polygon points="5,-30 10,-18 0,-18" fill="#FF8C42" />
        <polygon points="-14,-28 -11,-20 -18,-20" fill="#FFCC80" />
        <polygon points="4,-28 7,-20 1,-20" fill="#FFCC80" />
        {/* Face */}
        <circle cx="-9" cy="-20" r="2" fill="#333" />
        <circle cx="-1" cy="-20" r="2" fill="#333" />
        <ellipse cx="-5" cy="-14" rx="3" ry="2" fill="#333" />
        {/* Tail */}
        <path d="M22,0 Q40,-10 35,-25 Q30,-15 22,-5" fill="#FF8C42" />
        <path d="M35,-25 Q32,-18 28,-12" fill="white" opacity="0.7" />
      </g>
    </svg>
  );
}

// Treasure map
function SceneMap() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <rect width="300" height="200" fill="#FFF8E1" />
      {/* Map paper */}
      <rect x="50" y="25" width="200" height="150" rx="4" fill="#F5E6CA" />
      <rect x="50" y="25" width="200" height="150" rx="4" fill="none" stroke="#D7A86E" strokeWidth="2" />
      {/* Burnt edges */}
      <path d="M50,25 Q55,30 50,35 Q48,40 50,45" stroke="#C4A87C" strokeWidth="1" fill="none" />
      {/* Map path */}
      <path d="M80,140 L100,120 L130,130 L160,100 L190,110 L210,80" fill="none" stroke="#8D6E63" strokeWidth="2" strokeDasharray="6,4" />
      {/* Landmarks */}
      <Tree x={90} y={118} scale={0.3} />
      {/* Fountain */}
      <circle cx="160" cy="98" r="8" fill="#4FC3F7" opacity="0.5" />
      <rect x="157" y="88" width="6" height="10" fill="#90A4AE" />
      {/* Bridge */}
      <path d="M195,108 Q210,95 225,108" fill="none" stroke="#8D6E63" strokeWidth="3" />
      {/* X marks the spot */}
      <text x="200" y="80" fill="#FF6B6B" fontSize="24" fontWeight="bold" fontFamily="serif">X</text>
      {/* Compass rose */}
      <g transform="translate(80,60)">
        <circle cx="0" cy="0" r="12" fill="none" stroke="#8D6E63" strokeWidth="1" />
        <text x="-3" y="-14" fill="#8D6E63" fontSize="8" fontWeight="bold">N</text>
        <polygon points="0,-10 -3,0 0,-4 3,0" fill="#FF6B6B" />
        <polygon points="0,10 -3,0 0,4 3,0" fill="#90A4AE" />
      </g>
    </svg>
  );
}

// Backpack
function SceneBackpack() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <rect width="300" height="200" fill="#E3F2FD" />
      {/* Backpack */}
      <g transform="translate(150,100)">
        <rect x="-35" y="-30" width="70" height="80" rx="12" fill="#F44336" />
        <rect x="-30" y="-25" width="60" height="35" rx="8" fill="#EF5350" />
        {/* Pocket */}
        <rect x="-22" y="15" width="44" height="25" rx="6" fill="#D32F2F" />
        <rect x="-18" y="18" width="36" height="4" rx="2" fill="#C62828" />
        {/* Zipper */}
        <line x1="-22" y1="10" x2="22" y2="10" stroke="#FFC107" strokeWidth="2" />
        <circle cx="22" cy="10" r="3" fill="#FFC107" />
        {/* Straps */}
        <rect x="-38" y="-20" width="8" height="50" rx="3" fill="#D32F2F" />
        <rect x="30" y="-20" width="8" height="50" rx="3" fill="#D32F2F" />
        {/* Items peeking out */}
        <rect x="-10" y="-40" width="6" height="15" rx="2" fill="#FFE082" /> {/* Flashlight */}
        <circle cx="10" cy="-35" r="6" fill="#66BB6A" /> {/* Apple */}
      </g>
    </svg>
  );
}

// Compass
function SceneCompass() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <rect width="300" height="200" fill="#E8F5E9" />
      {/* Compass */}
      <g transform="translate(150,100)">
        <circle cx="0" cy="0" r="60" fill="#F5E6CA" stroke="#8D6E63" strokeWidth="3" />
        <circle cx="0" cy="0" r="55" fill="none" stroke="#D7A86E" strokeWidth="1" />
        {/* Cardinals */}
        <text x="-5" y="-38" fill="#333" fontSize="16" fontWeight="bold">N</text>
        <text x="-4" y="48" fill="#666" fontSize="14" fontWeight="bold">S</text>
        <text x="-45" y="5" fill="#666" fontSize="14" fontWeight="bold">W</text>
        <text x="35" y="5" fill="#666" fontSize="14" fontWeight="bold">E</text>
        {/* Needle */}
        <polygon points="0,-35 -6,0 0,-8 6,0" fill="#FF6B6B" />
        <polygon points="0,35 -6,0 0,8 6,0" fill="#90A4AE" />
        <circle cx="0" cy="0" r="4" fill="#8D6E63" />
        {/* Tick marks */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => (
          <line
            key={a}
            x1={Math.cos((a - 90) * Math.PI / 180) * 48}
            y1={Math.sin((a - 90) * Math.PI / 180) * 48}
            x2={Math.cos((a - 90) * Math.PI / 180) * 52}
            y2={Math.sin((a - 90) * Math.PI / 180) * 52}
            stroke="#8D6E63"
            strokeWidth={a % 90 === 0 ? 2 : 1}
          />
        ))}
      </g>
    </svg>
  );
}

// Wooden box / treasure
function SceneTreasureBox() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <Sky />
      <Ground color="#5D8A5D" />
      {/* Bridge */}
      <path d="M80,155 Q150,120 220,155" fill="none" stroke="#8D6E63" strokeWidth="8" />
      <rect x="78" y="155" width="6" height="30" fill="#795548" />
      <rect x="216" y="155" width="6" height="30" fill="#795548" />
      {/* Wooden box */}
      <g transform="translate(150,160)">
        <rect x="-22" y="-20" width="44" height="28" rx="3" fill="#A1887F" />
        <rect x="-22" y="-20" width="44" height="8" rx="3" fill="#8D6E63" />
        <rect x="-2" y="-16" width="4" height="4" rx="1" fill="#FFD54F" />
        {/* Leaves on box */}
        <ellipse cx="-18" cy="-22" rx="8" ry="4" fill="#66BB6A" transform="rotate(-20,-18,-22)" />
        <ellipse cx="15" cy="-20" rx="7" ry="3" fill="#4CAF50" transform="rotate(15,15,-20)" />
      </g>
    </svg>
  );
}

// Gold coin
function SceneGoldCoin() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <rect width="300" height="200" fill="#FFF8E1" />
      {/* Scroll/note */}
      <rect x="70" y="40" width="160" height="80" rx="4" fill="#F5E6CA" />
      <rect x="70" y="40" width="160" height="80" rx="4" fill="none" stroke="#D7A86E" strokeWidth="1.5" />
      <line x1="90" y1="60" x2="210" y2="60" stroke="#C4A87C" strokeWidth="1" />
      <line x1="90" y1="75" x2="210" y2="75" stroke="#C4A87C" strokeWidth="1" />
      <line x1="90" y1="90" x2="170" y2="90" stroke="#C4A87C" strokeWidth="1" />
      {/* Gold coin */}
      <g transform="translate(150,155)">
        <circle cx="0" cy="0" r="30" fill="#FFD93D" />
        <circle cx="0" cy="0" r="26" fill="#FFE66D" />
        <circle cx="0" cy="0" r="22" fill="none" stroke="#FFD93D" strokeWidth="1.5" />
        <Star x={0} y={0} size={12} fill="#FFD93D" />
      </g>
      {/* Sparkles */}
      <Star x={110} y={140} size={4} fill="#FFE66D" />
      <Star x={195} y={145} size={3} fill="#FFD93D" />
      <Star x={150} y={118} size={3} fill="#FFE66D" />
    </svg>
  );
}

// Sad/nervous kid
function SceneNervous() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <rect width="300" height="200" fill="#E3F2FD" />
      {/* Classroom background */}
      <rect x="0" y="130" width="300" height="70" fill="#FFCC80" />
      {/* Desk */}
      <rect x="100" y="120" width="100" height="8" rx="2" fill="#A1887F" />
      <rect x="110" y="128" width="6" height="40" fill="#8D6E63" />
      <rect x="184" y="128" width="6" height="40" fill="#8D6E63" />
      {/* Kid */}
      <g transform="translate(150,100)">
        <circle cx="0" cy="-10" r="18" fill="#FFCC80" />
        <circle cx="-6" cy="-12" r="2.5" fill="#333" />
        <circle cx="6" cy="-12" r="2.5" fill="#333" />
        <path d="M-4,-3 Q0,0 4,-3" stroke="#666" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Hair */}
        <path d="M-18,-15 Q-15,-30 0,-28 Q15,-30 18,-15" fill="#5D4037" />
        {/* Body */}
        <rect x="-12" y="8" width="24" height="20" rx="4" fill="#42A5F5" />
      </g>
    </svg>
  );
}

// Lunch table
function SceneLunch() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <rect width="300" height="200" fill="#FFF3E0" />
      {/* Table */}
      <rect x="50" y="110" width="200" height="8" rx="3" fill="#A1887F" />
      <rect x="70" y="118" width="8" height="55" fill="#8D6E63" />
      <rect x="222" y="118" width="8" height="55" fill="#8D6E63" />
      {/* Lunch tray */}
      <rect x="110" y="90" width="80" height="20" rx="4" fill="#E0E0E0" />
      <circle cx="130" cy="96" r="8" fill="#FF8C42" opacity="0.8" />
      <rect x="150" y="92" width="20" height="12" rx="2" fill="#FFE082" />
      <circle cx="180" cy="98" r="6" fill="#66BB6A" />
      {/* Kid sitting alone */}
      <g transform="translate(150,85)">
        <circle cx="0" cy="-12" r="12" fill="#FFCC80" />
        <circle cx="-4" cy="-13" r="1.5" fill="#333" />
        <circle cx="4" cy="-13" r="1.5" fill="#333" />
        <path d="M-3,-7 Q0,-5 3,-7" stroke="#666" strokeWidth="1" fill="none" />
        <rect x="-8" y="0" width="16" height="14" rx="3" fill="#66BB6A" />
      </g>
    </svg>
  );
}

// Waving hello
function SceneWaving() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <rect width="300" height="200" fill="#E8F5E9" />
      {/* Two kids */}
      {/* Kid 1 - Emma */}
      <g transform="translate(120,120)">
        <circle cx="0" cy="-15" r="16" fill="#FFCC80" />
        <path d="M-16,-20 Q-10,-35 0,-32 Q10,-35 16,-20" fill="#5D4037" />
        <circle cx="-5" cy="-16" r="2" fill="#333" />
        <circle cx="5" cy="-16" r="2" fill="#333" />
        <path d="M-3,-9 Q0,-6 3,-9" stroke="#333" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <rect x="-10" y="0" width="20" height="18" rx="4" fill="#E91E63" />
        {/* Waving arm */}
        <line x1="10" y1="5" x2="30" y2="-15" stroke="#FFCC80" strokeWidth="5" strokeLinecap="round" />
        <circle cx="30" cy="-15" r="4" fill="#FFCC80" />
      </g>
      {/* Kid 2 - Sam */}
      <g transform="translate(190,120)">
        <circle cx="0" cy="-15" r="16" fill="#D7A86E" />
        <path d="M-16,-22 Q-10,-36 0,-34 Q10,-36 16,-22" fill="#333" />
        <circle cx="-5" cy="-16" r="2" fill="#333" />
        <circle cx="5" cy="-16" r="2" fill="#333" />
        <path d="M-3,-8 Q0,-5 3,-8" stroke="#333" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <rect x="-10" y="0" width="20" height="18" rx="4" fill="#42A5F5" />
      </g>
    </svg>
  );
}

// Dinosaur drawing
function SceneDinosaur() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <rect width="300" height="200" fill="#FFF8E1" />
      {/* Paper */}
      <rect x="40" y="20" width="220" height="160" fill="white" stroke="#E0E0E0" strokeWidth="1" />
      {/* T-Rex drawing style */}
      <g transform="translate(150,100)">
        <ellipse cx="0" cy="0" rx="30" ry="22" fill="#66BB6A" />
        <circle cx="-25" cy="-20" r="18" fill="#66BB6A" />
        <circle cx="-28" cy="-24" r="4" fill="white" />
        <circle cx="-27" cy="-24" r="2" fill="#333" />
        <path d="M-38,-15 L-42,-12 L-38,-10 L-42,-7 L-38,-5" fill="none" stroke="#66BB6A" strokeWidth="2" />
        {/* Tiny arms */}
        <line x1="-10" y1="0" x2="-18" y2="8" stroke="#66BB6A" strokeWidth="4" strokeLinecap="round" />
        {/* Legs */}
        <rect x="-10" y="18" width="8" height="20" rx="3" fill="#66BB6A" />
        <rect x="10" y="18" width="8" height="20" rx="3" fill="#66BB6A" />
        {/* Tail */}
        <path d="M30,0 Q50,-5 55,10 Q58,18 65,15" fill="none" stroke="#66BB6A" strokeWidth="8" strokeLinecap="round" />
        {/* Spikes */}
        {[-15, -5, 5, 15].map((x, i) => (
          <polygon key={i} points={`${x - 4},-22 ${x},${-28 - i * 2} ${x + 4},-22`} fill="#4CAF50" />
        ))}
      </g>
      {/* Crayons */}
      <rect x="220" y="150" width="40" height="8" rx="2" fill="#FF6B6B" transform="rotate(-15,240,154)" />
      <rect x="230" y="160" width="35" height="8" rx="2" fill="#42A5F5" transform="rotate(10,247,164)" />
    </svg>
  );
}

// Handshake / friendship
function SceneHandshake() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <rect width="300" height="200" fill="#E8F5E9" />
      {/* Hands shaking */}
      <g transform="translate(150,100)">
        {/* Left hand */}
        <path d="M-60,10 L-20,5 L-10,-5 L0,5" fill="#FFCC80" stroke="#E6B87A" strokeWidth="2" />
        <ellipse cx="-10" cy="-5" rx="8" ry="5" fill="#FFCC80" />
        {/* Right hand */}
        <path d="M60,10 L20,5 L10,-5 L0,5" fill="#D7A86E" stroke="#C49A5E" strokeWidth="2" />
        <ellipse cx="10" cy="-5" rx="8" ry="5" fill="#D7A86E" />
        {/* Clasp */}
        <ellipse cx="0" cy="2" rx="12" ry="8" fill="#EABB88" />
      </g>
      {/* Stars */}
      <Star x={90} y={50} size={6} fill="#FFE66D" />
      <Star x={210} y={55} size={5} fill="#FFD93D" />
      <Star x={150} y={40} size={7} fill="#FFE66D" />
      <Star x={120} y={150} size={4} fill="#FFD93D" />
      <Star x={180} y={145} size={5} fill="#FFE66D" />
    </svg>
  );
}

// Sun with clouds (peeking out)
function SceneSunPeek() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <rect width="300" height="200" fill="#B0BEC5" />
      {/* Sun behind clouds */}
      <Sun x={150} y={80} />
      {/* Clouds partially covering */}
      <ellipse cx="120" cy="85" rx="45" ry="22" fill="#CFD8DC" />
      <ellipse cx="180" cy="88" rx="40" ry="20" fill="#ECEFF1" />
      <ellipse cx="150" cy="95" rx="35" ry="18" fill="#CFD8DC" opacity="0.8" />
      <Ground color="#5D8A5D" />
      <Flower x={80} y={175} color="#FFE66D" />
      <Flower x={220} y={178} color="#FF6B6B" />
    </svg>
  );
}

// Clouds
function SceneClouds() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <Sky />
      <Cloud x={60} y={40} scale={1.2} />
      <Cloud x={160} y={60} scale={1.5} />
      <Cloud x={240} y={35} />
      <Cloud x={100} y={90} scale={0.9} />
      <Cloud x={200} y={100} scale={1.1} />
      {/* Rain starting */}
      {[140, 155, 170, 185].map((x, i) => (
        <line key={i} x1={x} y1={78} x2={x - 2} y2={92} stroke="#4FC3F7" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      ))}
      <Ground color="#6BCB77" />
    </svg>
  );
}

// Evaporation / vapor rising
function SceneVapor() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <Sky />
      <Sun />
      <Water y={140} />
      {/* Vapor wisps rising */}
      {[80, 120, 160, 200, 240].map((x, i) => (
        <g key={i}>
          <path
            d={`M${x},${130 - i * 5} Q${x - 8},${110 - i * 5} ${x},${90 - i * 5} Q${x + 8},${70 - i * 5} ${x},${50 - i * 5}`}
            fill="none"
            stroke="white"
            strokeWidth="3"
            opacity={0.4 - i * 0.05}
            strokeLinecap="round"
          />
        </g>
      ))}
      {/* Arrow up */}
      <polygon points="150,35 140,55 145,55 145,75 155,75 155,55 160,55" fill="#4FC3F7" opacity="0.5" />
    </svg>
  );
}

// Cycle arrows
function SceneCycle() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <Sky />
      <Ground />
      {/* Cycle arrows */}
      <g transform="translate(150,95)">
        <path d="M0,-50 A50,50 0 0,1 43,25" fill="none" stroke="#4FC3F7" strokeWidth="5" strokeLinecap="round" />
        <polygon points="43,25 50,10 35,15" fill="#4FC3F7" />
        <path d="M43,25 A50,50 0 0,1 -43,25" fill="none" stroke="#66BB6A" strokeWidth="5" strokeLinecap="round" />
        <polygon points="-43,25 -50,10 -35,15" fill="#66BB6A" />
        <path d="M-43,25 A50,50 0 0,1 0,-50" fill="none" stroke="#FFE66D" strokeWidth="5" strokeLinecap="round" />
        <polygon points="0,-50 -10,-40 5,-40" fill="#FFE66D" />
        {/* Labels */}
        <Sun x={0} y={-65} />
        <Cloud x={55} y={30} scale={0.5} />
      </g>
      {/* Rain drops */}
      <line x1="90" y1="130" x2="88" y2="142" stroke="#4FC3F7" strokeWidth="2" strokeLinecap="round" />
      <line x1="105" y1="135" x2="103" y2="147" stroke="#4FC3F7" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Cat scene
function SceneCat() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <Sky />
      <Cloud x={80} y={30} />
      <Sun />
      <Ground />
      {/* Cat */}
      <g transform="translate(150,148)">
        <ellipse cx="0" cy="0" rx="18" ry="14" fill="#FF8C42" />
        <circle cx="-12" cy="-18" r="12" fill="#FF8C42" />
        {/* Ears */}
        <polygon points="-20,-28 -16,-18 -24,-18" fill="#FF8C42" />
        <polygon points="-4,-28 -8,-18 0,-18" fill="#FF8C42" />
        <polygon points="-19,-26 -17,-20 -22,-20" fill="#FFCC80" />
        <polygon points="-5,-26 -9,-20 -1,-20" fill="#FFCC80" />
        {/* Face */}
        <circle cx="-15" cy="-20" r="2" fill="#333" />
        <circle cx="-9" cy="-20" r="2" fill="#333" />
        <ellipse cx="-12" cy="-15" rx="2" ry="1.5" fill="#F8BBD0" />
        {/* Whiskers */}
        <line x1="-22" y1="-16" x2="-32" y2="-18" stroke="#666" strokeWidth="0.8" />
        <line x1="-22" y1="-14" x2="-32" y2="-14" stroke="#666" strokeWidth="0.8" />
        <line x1="-2" y1="-16" x2="8" y2="-18" stroke="#666" strokeWidth="0.8" />
        <line x1="-2" y1="-14" x2="8" y2="-14" stroke="#666" strokeWidth="0.8" />
        {/* Tail */}
        <path d="M18,0 Q30,-5 28,-18 Q26,-25 22,-22" fill="none" stroke="#FF8C42" strokeWidth="5" strokeLinecap="round" />
        {/* Stripes */}
        <line x1="-5" y1="-5" x2="5" y2="-5" stroke="#E67E22" strokeWidth="2" />
        <line x1="-6" y1="0" x2="6" y2="0" stroke="#E67E22" strokeWidth="2" />
      </g>
    </svg>
  );
}

// Surprised face
function SceneSurprised() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <rect width="300" height="200" fill="#FFF3E0" />
      {/* Big surprised face */}
      <circle cx="150" cy="95" r="55" fill="#FFCC80" />
      {/* Eyes wide */}
      <circle cx="130" cy="80" r="10" fill="white" />
      <circle cx="170" cy="80" r="10" fill="white" />
      <circle cx="130" cy="80" r="5" fill="#333" />
      <circle cx="170" cy="80" r="5" fill="#333" />
      <circle cx="132" cy="78" r="2" fill="white" />
      <circle cx="172" cy="78" r="2" fill="white" />
      {/* Eyebrows raised */}
      <path d="M120,65 Q130,58 140,65" stroke="#5D4037" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M160,65 Q170,58 180,65" stroke="#5D4037" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Mouth */}
      <ellipse cx="150" cy="112" rx="10" ry="12" fill="#333" />
      {/* Blush */}
      <circle cx="118" cy="100" r="8" fill="#F8BBD0" opacity="0.4" />
      <circle cx="182" cy="100" r="8" fill="#F8BBD0" opacity="0.4" />
      {/* Exclamation marks */}
      <text x="80" y="50" fill="#FF6B6B" fontSize="28" fontWeight="bold">!</text>
      <text x="210" y="50" fill="#FF6B6B" fontSize="28" fontWeight="bold">!</text>
    </svg>
  );
}

// Cat climbing tree
function SceneCatClimbing() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <Sky />
      <Cloud x={60} y={25} />
      <Sun />
      <Ground />
      {/* Big tree */}
      <rect x="135" y="40" width="30" height="150" rx="5" fill="#5D4037" />
      <ellipse cx="150" cy="35" rx="65" ry="40" fill="#388E3C" />
      <ellipse cx="120" cy="45" rx="40" ry="30" fill="#43A047" />
      <ellipse cx="180" cy="40" rx="40" ry="30" fill="#2E7D32" />
      {/* Branch */}
      <rect x="160" y="80" width="50" height="8" rx="3" fill="#5D4037" transform="rotate(-10,185,84)" />
      {/* Cat on trunk */}
      <g transform="translate(145,110) rotate(-5)">
        <ellipse cx="0" cy="0" rx="10" ry="8" fill="#FF8C42" />
        <circle cx="-8" cy="-10" r="8" fill="#FF8C42" />
        <circle cx="-10" cy="-12" r="1.5" fill="#333" />
        <circle cx="-6" cy="-12" r="1.5" fill="#333" />
        {/* Claws gripping */}
        <line x1="-5" y1="5" x2="-8" y2="10" stroke="#FF8C42" strokeWidth="3" strokeLinecap="round" />
        <line x1="5" y1="5" x2="8" y2="10" stroke="#FF8C42" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// Paw prints
function ScenePawPrint() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <Sky />
      <Sun />
      <Ground />
      {/* Paw prints */}
      {[
        { x: 80, y: 170, r: -15 }, { x: 120, y: 155, r: 10 },
        { x: 160, y: 165, r: -5 }, { x: 200, y: 150, r: 12 },
      ].map((p, i) => (
        <g key={i} transform={`translate(${p.x},${p.y}) rotate(${p.r}) scale(0.8)`}>
          <ellipse cx="0" cy="5" rx="8" ry="10" fill="#8D6E63" opacity="0.6" />
          <circle cx="-7" cy="-5" r="4" fill="#8D6E63" opacity="0.6" />
          <circle cx="7" cy="-5" r="4" fill="#8D6E63" opacity="0.6" />
          <circle cx="-3" cy="-9" r="3.5" fill="#8D6E63" opacity="0.6" />
          <circle cx="3" cy="-9" r="3.5" fill="#8D6E63" opacity="0.6" />
        </g>
      ))}
      <Tree x={40} y={168} scale={0.7} />
      <Tree x={260} y={170} scale={0.6} />
    </svg>
  );
}

// Bird nest with baby
function SceneBabyBird() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <Sky />
      <Cloud x={80} y={25} />
      <Sun />
      <Tree x={150} y={160} scale={1.5} />
      {/* Nest on branch */}
      <rect x="170" y="110" width="50" height="7" rx="3" fill="#5D4037" />
      <ellipse cx="205" cy="108" rx="20" ry="10" fill="#8D6E63" />
      <path d="M186,108 Q195,98 205,100 Q215,98 224,108" fill="#A1887F" stroke="#795548" strokeWidth="1" />
      {/* Baby bird */}
      <ellipse cx="200" cy="95" rx="9" ry="8" fill="#FFE082" />
      <circle cx="196" cy="91" r="6" fill="#FFECB3" />
      <circle cx="194" cy="89" r="1.5" fill="#333" />
      <polygon points="190,92 184,91 190,95" fill="#FF8C42" />
      {/* Chirp lines */}
      <path d="M183,85 Q178,82 175,85" fill="none" stroke="#FFD54F" strokeWidth="1" />
      <path d="M180,80 Q175,77 172,80" fill="none" stroke="#FFD54F" strokeWidth="1" />
      <Ground />
    </svg>
  );
}

// Cat with heart / thank you
function SceneCatHeart() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <rect width="300" height="200" fill="#FCE4EC" />
      {/* Hearts floating */}
      {[
        { x: 80, y: 40, s: 0.5 }, { x: 220, y: 35, s: 0.4 },
        { x: 150, y: 25, s: 0.6 }, { x: 110, y: 60, s: 0.3 }, { x: 200, y: 55, s: 0.35 },
      ].map((h, i) => (
        <g key={i} transform={`translate(${h.x},${h.y}) scale(${h.s})`}>
          <path d="M0,-10 C-10,-20 -25,-10 -15,5 L0,18 L15,5 C25,-10 10,-20 0,-10Z" fill="#FF6B6B" opacity="0.4" />
        </g>
      ))}
      {/* Cat */}
      <g transform="translate(120,140)">
        <ellipse cx="0" cy="0" rx="16" ry="12" fill="#FF8C42" />
        <circle cx="-10" cy="-16" r="10" fill="#FF8C42" />
        <polygon points="-17,-24 -14,-16 -20,-16" fill="#FF8C42" />
        <polygon points="-3,-24 -6,-16 0,-16" fill="#FF8C42" />
        <circle cx="-12" cy="-18" r="2" fill="#333" />
        <circle cx="-8" cy="-18" r="2" fill="#333" />
        <path d="M-12,-12 Q-10,-9 -8,-12" stroke="#333" strokeWidth="1" fill="none" />
      </g>
      {/* Bird */}
      <g transform="translate(185,135)">
        <ellipse cx="0" cy="0" rx="10" ry="8" fill="#90A4AE" />
        <circle cx="-6" cy="-6" r="7" fill="#B0BEC5" />
        <circle cx="-8" cy="-8" r="2" fill="#333" />
        <polygon points="-12,-5 -18,-6 -12,-2" fill="#FF8C42" />
        {/* Wing */}
        <ellipse cx="5" cy="-2" rx="7" ry="5" fill="#78909C" />
      </g>
      {/* Big heart between them */}
      <g transform="translate(155,115) scale(0.8)">
        <path d="M0,-10 C-8,-18 -20,-10 -12,3 L0,14 L12,3 C20,-10 8,-18 0,-10Z" fill="#FF6B6B" />
      </g>
    </svg>
  );
}

// Water/ocean
function SceneOcean() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <Sky />
      <Sun />
      <Cloud x={70} y={25} />
      <Water y={100} />
      {/* Waves */}
      <path d="M0,100 Q30,90 60,100 Q90,110 120,100 Q150,90 180,100 Q210,110 240,100 Q270,90 300,100" fill="none" stroke="#4FC3F7" strokeWidth="2" />
      <path d="M0,115 Q30,105 60,115 Q90,125 120,115 Q150,105 180,115 Q210,125 240,115 Q270,105 300,115" fill="none" stroke="#29B6F6" strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}

// Surprised/gasping
function SceneGasp() {
  return <SceneSurprised />;
}

// Park with fountain and bridge
function ScenePark() {
  return (
    <svg viewBox="0 0 300 200" className="w-full h-full">
      <SharedDefs />
      <Sky />
      <Cloud x={80} y={25} />
      <Sun />
      <Ground />
      <Tree x={40} y={168} scale={0.9} />
      <Tree x={260} y={170} scale={0.8} />
      {/* Path */}
      <path d="M0,190 Q75,175 150,175 Q225,175 300,190" fill="#D7A86E" />
      {/* Fountain */}
      <rect x="135" y="145" width="30" height="25" rx="4" fill="#90A4AE" />
      <rect x="125" y="170" width="50" height="5" rx="2" fill="#78909C" />
      <ellipse cx="150" cy="145" rx="8" ry="3" fill="#4FC3F7" />
      {/* Water spray */}
      <path d="M150,145 Q148,130 145,120" fill="none" stroke="#4FC3F7" strokeWidth="2" strokeLinecap="round" />
      <path d="M150,145 Q152,130 155,120" fill="none" stroke="#4FC3F7" strokeWidth="2" strokeLinecap="round" />
      <path d="M150,145 Q150,128 150,118" fill="none" stroke="#4FC3F7" strokeWidth="2" strokeLinecap="round" />
      <Flower x={100} y={178} color="#FF6B6B" />
      <Flower x={200} y={180} color="#FFE66D" />
    </svg>
  );
}

// ── EMOJI → SCENE MAPPING ─────────────────────────────────────

const sceneMap: Record<string, () => ReactNode> = {
  // Goodnight Moon
  '\uD83C\uDF15': SceneFullMoon,      // full moon
  '\u2B50': SceneStars,               // star
  '\uD83C\uDF33': SceneTreeNight,     // tree (bedtime context)
  '\uD83D\uDC26': SceneBirdNest,      // bird
  '\uD83D\uDE34': SceneSleeping,      // sleeping

  // The Little Duck
  '\uD83E\uDD86': SceneDuck,          // duck
  '\uD83D\uDCA6': SceneSplash,        // splash
  '\uD83D\uDC38': SceneFrog,          // frog
  '\u2600\uFE0F': SceneSunny,         // sun

  // My Best Friend
  '\uD83E\uDDF8': SceneTeddyBear,     // teddy bear
  '\uD83E\uDD17': SceneHug,           // hugging
  '\uD83C\uDF6A': SceneCookies,       // cookie
  '\uD83D\uDC30': SceneBunny,         // rabbit
  '\u2764\uFE0F': SceneHeart,         // heart

  // The Magic Garden
  '\uD83D\uDEAA': SceneDoor,          // door
  '\uD83C\uDF3B': SceneGarden,        // sunflower
  '\uD83C\uDF38': SceneBlossoms,      // cherry blossom
  '\uD83E\uDD8B': SceneButterfly,     // butterfly
  '\u2728': SceneSparkle,             // sparkle
  '\uD83D\uDE0A': SceneHappy,         // smiley

  // Rainbow After Rain
  '\uD83C\uDF27\uFE0F': SceneRain,    // rain
  '\uD83C\uDF37': SceneTulip,         // tulip
  '\uD83C\uDF08': SceneRainbow,       // rainbow
  '\uD83C\uDFA8': ScenePalette,       // palette
  '\uD83E\uDD8A': SceneFox,           // fox

  // The Brave Little Cat
  '\uD83D\uDC31': SceneCat,           // cat
  '\uD83D\uDE2E': SceneSurprised,     // surprised
  '\uD83D\uDC3E': ScenePawPrint,      // paw print
  '\uD83E\uDEB9': SceneBabyBird,      // nest
  '\uD83D\uDC95': SceneCatHeart,      // two hearts

  // The Treasure Map
  '\uD83D\uDDFA\uFE0F': SceneMap,     // map
  '\uD83C\uDF33_park': ScenePark,     // tree (park context)
  '\uD83C\uDF92': SceneBackpack,      // backpack
  '\uD83E\uDDED': SceneCompass,       // compass
  '\uD83D\uDCE6': SceneTreasureBox,   // package
  '\uD83E\uDE99': SceneGoldCoin,      // coin
  '\uD83D\uDE04': SceneHappy,         // grinning

  // The New Kid
  '\uD83D\uDE1F': SceneNervous,       // worried
  '\uD83C\uDF7D\uFE0F': SceneLunch,   // plate
  '\uD83D\uDC4B': SceneWaving,        // wave
  '\uD83E\uDD95': SceneDinosaur,      // dinosaur
  '\uD83E\uDD1D': SceneHandshake,     // handshake

  // The Water Cycle
  '\u2601\uFE0F': SceneClouds,        // cloud
  '\uD83C\uDF25\uFE0F': SceneSunPeek, // sun behind cloud
  '\u2B06\uFE0F': SceneVapor,         // up arrow
  '\uD83D\uDD04': SceneCycle,         // cycle
};

/**
 * Get the SVG scene illustration for a given emoji.
 * Returns the scene component or null if no match.
 */
export function getSceneForEmoji(emoji: string): ReactNode | null {
  const SceneComponent = sceneMap[emoji];
  if (SceneComponent) {
    return <SceneComponent />;
  }
  return null;
}

/**
 * Get all available scene keys (for debugging)
 */
export function getAvailableScenes(): string[] {
  return Object.keys(sceneMap);
}
