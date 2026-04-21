/**
 * StoryCovers — Illustrated SVG cover art for the story library.
 * Each cover is a charming, colorful scene sized for book-card display.
 * Mapped by story ID for direct lookup from storiesData.
 */
import { type ReactNode } from 'react';

interface CoverProps {
  className?: string;
}

// ── Shared primitives ──────────────────────────────────────

const CoverStar = ({ x, y, s = 3, fill = '#FFE66D' }: { x: number; y: number; s?: number; fill?: string }) => (
  <polygon
    points={`${x},${y - s} ${x + s * 0.35},${y - s * 0.35} ${x + s},${y} ${x + s * 0.35},${y + s * 0.35} ${x},${y + s} ${x - s * 0.35},${y + s * 0.35} ${x - s},${y} ${x - s * 0.35},${y - s * 0.35}`}
    fill={fill}
    opacity="0.9"
  />
);

const Sparkle = ({ x, y, size = 6 }: { x: number; y: number; size?: number }) => (
  <g transform={`translate(${x},${y})`}>
    <line x1="0" y1={-size} x2="0" y2={size} stroke="#FFE66D" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    <line x1={-size} y1="0" x2={size} y2="0" stroke="#FFE66D" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    <line x1={-size * 0.6} y1={-size * 0.6} x2={size * 0.6} y2={size * 0.6} stroke="#FFE66D" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
    <line x1={size * 0.6} y1={-size * 0.6} x2={-size * 0.6} y2={size * 0.6} stroke="#FFE66D" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
  </g>
);

// ── Goodnight Moon (s-2-bed-1) ─────────────────────────────

function CoverGoodnightMoon(_: CoverProps) {
  return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="cm-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0F0A2E" />
          <stop offset="100%" stopColor="#1A1055" />
        </linearGradient>
      </defs>
      {/* Night sky */}
      <rect width="200" height="140" fill="url(#cm-night)" rx="12" />
      {/* Stars */}
      <CoverStar x={30} y={20} s={2.5} />
      <CoverStar x={60} y={35} s={2} />
      <CoverStar x={140} y={18} s={3} />
      <CoverStar x={170} y={40} s={2} />
      <CoverStar x={110} y={25} s={2.5} />
      <CoverStar x={15} y={50} s={1.5} />
      <CoverStar x={85} y={15} s={1.5} />
      {/* Big moon */}
      <circle cx="150" cy="45" r="28" fill="#FFF8DC" />
      <circle cx="158" cy="40" r="28" fill="url(#cm-night)" />
      {/* Moon glow */}
      <circle cx="150" cy="45" r="35" fill="#FFF8DC" opacity="0.06" />
      {/* Rolling hills */}
      <ellipse cx="60" cy="140" rx="90" ry="35" fill="#1A3A1A" />
      <ellipse cx="160" cy="140" rx="70" ry="30" fill="#1A3A1A" opacity="0.8" />
      {/* Sleepy house */}
      <rect x="80" y="85" width="35" height="30" rx="2" fill="#2D2040" />
      <polygon points="78,87 97,70 118,87" fill="#3A2555" />
      {/* Window glow */}
      <rect x="88" y="93" width="10" height="10" rx="1" fill="#FFE66D" opacity="0.6" />
      <rect x="102" y="93" width="8" height="10" rx="1" fill="#FFE66D" opacity="0.4" />
      {/* Zzz */}
      <text x="125" y="80" fill="#C4AAFF" fontSize="10" fontWeight="bold" opacity="0.5">z</text>
      <text x="132" y="72" fill="#C4AAFF" fontSize="8" fontWeight="bold" opacity="0.4">z</text>
      <text x="137" y="66" fill="#C4AAFF" fontSize="6" fontWeight="bold" opacity="0.3">z</text>
    </svg>
  );
}

// ── The Little Duck (s-2-ani-1) ────────────────────────────

function CoverLittleDuck(_: CoverProps) {
  return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="cd-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87CEEB" />
          <stop offset="100%" stopColor="#B8E4F0" />
        </linearGradient>
      </defs>
      {/* Sky */}
      <rect width="200" height="140" fill="url(#cd-sky)" rx="12" />
      {/* Clouds */}
      <ellipse cx="40" cy="25" rx="22" ry="10" fill="white" opacity="0.8" />
      <ellipse cx="28" cy="28" rx="14" ry="8" fill="white" opacity="0.7" />
      <ellipse cx="150" cy="20" rx="18" ry="8" fill="white" opacity="0.7" />
      {/* Sun */}
      <circle cx="175" cy="28" r="16" fill="#FFE66D" />
      <circle cx="175" cy="28" r="22" fill="#FFE66D" opacity="0.15" />
      {/* Water/pond */}
      <ellipse cx="100" cy="120" rx="90" ry="30" fill="#4ECDC4" opacity="0.4" />
      <ellipse cx="100" cy="118" rx="85" ry="25" fill="#45B7D1" opacity="0.3" />
      {/* Lily pad */}
      <ellipse cx="50" cy="110" rx="12" ry="5" fill="#6BCB77" opacity="0.7" />
      <ellipse cx="150" cy="115" rx="10" ry="4" fill="#6BCB77" opacity="0.6" />
      {/* Duck body */}
      <ellipse cx="100" cy="95" rx="22" ry="15" fill="#FFE066" />
      {/* Duck head */}
      <circle cx="118" cy="78" r="12" fill="#FFE066" />
      {/* Duck eye */}
      <circle cx="122" cy="75" r="2.5" fill="#2D2D3A" />
      <circle cx="123" cy="74" r="0.8" fill="white" />
      {/* Duck bill */}
      <ellipse cx="132" cy="80" rx="7" ry="3" fill="#FF8C42" />
      {/* Duck wing */}
      <path d="M85 90 Q90 80 100 85 Q92 92 85 90Z" fill="#E6C84A" />
      {/* Water ripples */}
      <path d="M75 105 Q80 103 85 105 Q90 107 95 105" stroke="#45B7D1" strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M105 108 Q110 106 115 108 Q120 110 125 108" stroke="#45B7D1" strokeWidth="1" fill="none" opacity="0.4" />
      {/* Frog on lily pad */}
      <ellipse cx="50" cy="105" rx="6" ry="5" fill="#6BCB77" />
      <circle cx="47" cy="100" r="1.5" fill="#2D2D3A" />
      <circle cx="53" cy="100" r="1.5" fill="#2D2D3A" />
    </svg>
  );
}

// ── My Best Friend (s-2-fri-1) ─────────────────────────────

function CoverBestFriend(_: CoverProps) {
  return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="cf-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF0F5" />
          <stop offset="100%" stopColor="#FFE4EC" />
        </linearGradient>
      </defs>
      <rect width="200" height="140" fill="url(#cf-bg)" rx="12" />
      {/* Hearts floating */}
      <path d="M35 20 C35 16 40 14 42 18 C44 14 49 16 49 20 C49 26 42 30 42 30 C42 30 35 26 35 20Z" fill="#FF8FAB" opacity="0.4" />
      <path d="M155 15 C155 12 158 11 159 14 C160 11 163 12 163 15 C163 19 159 21 159 21 C159 21 155 19 155 15Z" fill="#FF6B6B" opacity="0.3" />
      <path d="M170 50 C170 48 172 47 173 49 C174 47 176 48 176 50 C176 53 173 54 173 54 C173 54 170 53 170 50Z" fill="#FF8FAB" opacity="0.35" />
      {/* Ground */}
      <ellipse cx="100" cy="138" rx="100" ry="20" fill="#A8E6CF" opacity="0.5" />
      {/* Teddy bear */}
      <circle cx="75" cy="95" r="20" fill="#D4A574" />
      <circle cx="75" cy="78" r="14" fill="#D4A574" />
      {/* Teddy ears */}
      <circle cx="63" cy="68" r="6" fill="#C0956A" />
      <circle cx="63" cy="68" r="3.5" fill="#E8C5A0" />
      <circle cx="87" cy="68" r="6" fill="#C0956A" />
      <circle cx="87" cy="68" r="3.5" fill="#E8C5A0" />
      {/* Teddy face */}
      <circle cx="70" cy="75" r="2" fill="#2D2D3A" />
      <circle cx="80" cy="75" r="2" fill="#2D2D3A" />
      <ellipse cx="75" cy="81" rx="3" ry="2" fill="#8B6914" />
      <path d="M72 84 Q75 87 78 84" stroke="#8B6914" strokeWidth="1.2" fill="none" />
      {/* Bunny */}
      <circle cx="125" cy="92" r="18" fill="#F5F5F5" />
      <circle cx="125" cy="76" r="13" fill="#F5F5F5" />
      {/* Bunny ears */}
      <ellipse cx="118" cy="56" rx="5" ry="16" fill="#F5F5F5" />
      <ellipse cx="118" cy="56" rx="3" ry="12" fill="#FFB6C1" opacity="0.5" />
      <ellipse cx="132" cy="56" rx="5" ry="16" fill="#F5F5F5" />
      <ellipse cx="132" cy="56" rx="3" ry="12" fill="#FFB6C1" opacity="0.5" />
      {/* Bunny face */}
      <circle cx="120" cy="73" r="2" fill="#FF6B6B" />
      <circle cx="130" cy="73" r="2" fill="#FF6B6B" />
      <ellipse cx="125" cy="78" rx="2" ry="1.5" fill="#FFB6C1" />
      {/* Cookie between them */}
      <circle cx="100" cy="100" r="8" fill="#D4A050" />
      <circle cx="98" cy="98" r="1.5" fill="#8B6914" opacity="0.5" />
      <circle cx="103" cy="101" r="1.5" fill="#8B6914" opacity="0.5" />
      <circle cx="99" cy="103" r="1" fill="#8B6914" opacity="0.4" />
      {/* Arms reaching toward each other */}
      <path d="M88 92 Q95 96 97 98" stroke="#D4A574" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M112 90 Q105 94 103 98" stroke="#F5F5F5" strokeWidth="4" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// ── The Magic Garden (s-4-adv-1) ───────────────────────────

function CoverMagicGarden(_: CoverProps) {
  return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="cg-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8F5E9" />
          <stop offset="100%" stopColor="#C8E6C9" />
        </linearGradient>
      </defs>
      <rect width="200" height="140" fill="url(#cg-sky)" rx="12" />
      {/* Sparkles */}
      <Sparkle x={30} y={25} size={5} />
      <Sparkle x={170} y={30} size={4} />
      <Sparkle x={95} y={15} size={3} />
      {/* Ground with flowers */}
      <ellipse cx="100" cy="140" rx="110" ry="28" fill="#6BCB77" />
      <ellipse cx="100" cy="138" rx="100" ry="22" fill="#7DD88A" />
      {/* Large sunflower left */}
      <rect x="38" y="70" width="3" height="40" fill="#4CAF50" />
      <circle cx="40" cy="65" r="14" fill="#FFD93D" />
      <circle cx="40" cy="65" r="7" fill="#8B6914" />
      {/* Petals */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <ellipse
          key={angle}
          cx={40 + Math.cos((angle * Math.PI) / 180) * 11}
          cy={65 + Math.sin((angle * Math.PI) / 180) * 11}
          rx="5" ry="3"
          fill="#FFE66D"
          transform={`rotate(${angle}, ${40 + Math.cos((angle * Math.PI) / 180) * 11}, ${65 + Math.sin((angle * Math.PI) / 180) * 11})`}
        />
      ))}
      {/* Magic door */}
      <rect x="85" y="60" width="30" height="50" rx="15" fill="#8B5CF6" opacity="0.8" />
      <rect x="88" y="63" width="24" height="44" rx="12" fill="#A78BFA" opacity="0.4" />
      <circle cx="108" cy="85" r="2.5" fill="#FFE66D" />
      {/* Glow around door */}
      <rect x="83" y="58" width="34" height="54" rx="17" stroke="#FFE66D" strokeWidth="1.5" opacity="0.3" fill="none" />
      {/* Butterfly */}
      <g transform="translate(140, 50)">
        <ellipse cx="0" cy="0" rx="1.5" ry="5" fill="#2D2D3A" />
        <ellipse cx="-7" cy="-3" rx="7" ry="5" fill="#A78BFA" opacity="0.8" />
        <ellipse cx="7" cy="-3" rx="7" ry="5" fill="#FF8FAB" opacity="0.8" />
        <ellipse cx="-5" cy="3" rx="5" ry="4" fill="#8B5CF6" opacity="0.6" />
        <ellipse cx="5" cy="3" rx="5" ry="4" fill="#FF6B6B" opacity="0.6" />
      </g>
      {/* Small flowers */}
      {[20, 65, 130, 160, 180].map((x, i) => (
        <g key={i} transform={`translate(${x}, ${115 + (i % 2) * 5})`}>
          <rect x="-0.5" y="0" width="1.5" height="8" fill="#4CAF50" />
          <circle cx="0" cy="-2" r="3" fill={['#FF6B6B', '#FFE66D', '#A78BFA', '#FF8FAB', '#4ECDC4'][i]} />
          <circle cx="0" cy="-2" r="1.5" fill="white" opacity="0.5" />
        </g>
      ))}
    </svg>
  );
}

// ── Rainbow After Rain (s-4-nat-1) ────────────────────────

function CoverRainbow(_: CoverProps) {
  return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="cr-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87CEEB" />
          <stop offset="60%" stopColor="#B8E4F0" />
          <stop offset="100%" stopColor="#E8F5E9" />
        </linearGradient>
      </defs>
      <rect width="200" height="140" fill="url(#cr-sky)" rx="12" />
      {/* Rainbow arcs */}
      {[
        { r: 65, color: '#FF6B6B' },
        { r: 60, color: '#FF8C42' },
        { r: 55, color: '#FFE66D' },
        { r: 50, color: '#6BCB77' },
        { r: 45, color: '#45B7D1' },
        { r: 40, color: '#A78BFA' },
      ].map(({ r, color }) => (
        <path
          key={color}
          d={`M ${100 - r} 110 A ${r} ${r} 0 0 1 ${100 + r} 110`}
          stroke={color}
          strokeWidth="5"
          fill="none"
          opacity="0.7"
        />
      ))}
      {/* Sun peeking */}
      <circle cx="170" cy="30" r="18" fill="#FFE66D" />
      <circle cx="170" cy="30" r="24" fill="#FFE66D" opacity="0.12" />
      {/* Rain cloud (small, departing) */}
      <g opacity="0.5" transform="translate(25, 20)">
        <ellipse cx="15" cy="10" rx="18" ry="10" fill="#B0BEC5" />
        <ellipse cx="5" cy="13" rx="12" ry="8" fill="#90A4AE" />
        <ellipse cx="25" cy="13" rx="12" ry="8" fill="#90A4AE" />
        {/* Rain drops */}
        <line x1="8" y1="22" x2="6" y2="30" stroke="#45B7D1" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <line x1="18" y1="22" x2="16" y2="30" stroke="#45B7D1" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      </g>
      {/* Green meadow */}
      <ellipse cx="100" cy="140" rx="110" ry="25" fill="#6BCB77" />
      {/* Flowers in meadow */}
      {[30, 55, 80, 120, 155, 175].map((x, i) => (
        <g key={i} transform={`translate(${x}, ${120 + (i % 2) * 3})`}>
          <rect x="-0.5" y="0" width="1.5" height="6" fill="#4CAF50" />
          <circle cx="0" cy="-2" r="3" fill={['#FF6B6B', '#FFE66D', '#A78BFA', '#FF8FAB', '#4ECDC4', '#FF8C42'][i]} />
        </g>
      ))}
      {/* Cute fox */}
      <g transform="translate(155, 100)">
        <ellipse cx="0" cy="5" rx="8" ry="6" fill="#FF8C42" />
        <circle cx="0" cy="-2" r="6" fill="#FF8C42" />
        <polygon points="-5,-7 -3,-1 -8,-2" fill="#FF8C42" />
        <polygon points="5,-7 3,-1 8,-2" fill="#FF8C42" />
        <polygon points="-5,-7 -3,-1 -8,-2" fill="#FFE0B2" opacity="0.5" />
        <polygon points="5,-7 3,-1 8,-2" fill="#FFE0B2" opacity="0.5" />
        <circle cx="-2" cy="-3" r="1" fill="#2D2D3A" />
        <circle cx="2" cy="-3" r="1" fill="#2D2D3A" />
        <ellipse cx="0" cy="0" rx="1" ry="0.7" fill="#2D2D3A" />
        <ellipse cx="0" cy="1" rx="3" ry="2" fill="white" />
      </g>
    </svg>
  );
}

// ── The Brave Little Cat (s-4-ani-1) ──────────────────────

function CoverBraveCat(_: CoverProps) {
  return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="cc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87CEEB" />
          <stop offset="100%" stopColor="#C8E6C9" />
        </linearGradient>
      </defs>
      <rect width="200" height="140" fill="url(#cc-sky)" rx="12" />
      {/* Big tree */}
      <rect x="55" y="45" width="14" height="70" rx="3" fill="#8B6914" />
      <ellipse cx="62" cy="40" rx="35" ry="30" fill="#4CAF50" />
      <ellipse cx="50" cy="48" rx="22" ry="20" fill="#66BB6A" />
      <ellipse cx="74" cy="45" rx="22" ry="20" fill="#43A047" />
      {/* Nest in tree */}
      <ellipse cx="78" cy="50" rx="10" ry="5" fill="#8B6914" opacity="0.8" />
      <path d="M70 50 Q74 45 78 50 Q82 45 86 50" stroke="#6D4C13" strokeWidth="1.5" fill="none" />
      {/* Baby bird in nest */}
      <circle cx="78" cy="46" r="4" fill="#FFE66D" />
      <circle cx="80" cy="44" r="1" fill="#2D2D3A" />
      <polygon points="82,46 86,45 82,47" fill="#FF8C42" />
      {/* Cat climbing tree */}
      <g transform="translate(48, 65)">
        <ellipse cx="0" cy="0" rx="8" ry="10" fill="#9E9E9E" />
        <circle cx="0" cy="-12" r="7" fill="#9E9E9E" />
        {/* Ears */}
        <polygon points="-5,-18 -2,-12 -8,-13" fill="#9E9E9E" />
        <polygon points="5,-18 2,-12 8,-13" fill="#9E9E9E" />
        <polygon points="-5,-18 -2,-12 -8,-13" fill="#FFB6C1" opacity="0.4" />
        <polygon points="5,-18 2,-12 8,-13" fill="#FFB6C1" opacity="0.4" />
        {/* Cat face */}
        <circle cx="-2" cy="-14" r="1.5" fill="#2D2D3A" />
        <circle cx="2" cy="-14" r="1.5" fill="#2D2D3A" />
        <circle cx="-2" cy="-13.5" r="0.5" fill="white" />
        <circle cx="2" cy="-13.5" r="0.5" fill="white" />
        <ellipse cx="0" cy="-10" rx="1.2" ry="0.8" fill="#FFB6C1" />
        {/* Determined eyebrows */}
        <line x1="-4" y1="-16" x2="-1" y2="-15.5" stroke="#2D2D3A" strokeWidth="1" strokeLinecap="round" />
        <line x1="4" y1="-16" x2="1" y2="-15.5" stroke="#2D2D3A" strokeWidth="1" strokeLinecap="round" />
        {/* Paws gripping */}
        <circle cx="-6" cy="-5" r="2.5" fill="#BDBDBD" />
        <circle cx="6" cy="-5" r="2.5" fill="#BDBDBD" />
        {/* Tail */}
        <path d="M6 8 Q16 5 14 -2" stroke="#9E9E9E" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      {/* Green ground */}
      <ellipse cx="100" cy="140" rx="110" ry="22" fill="#6BCB77" />
      {/* Small flower */}
      <g transform="translate(160, 115)">
        <rect x="-0.5" y="0" width="1.5" height="8" fill="#4CAF50" />
        <circle cx="0" cy="-2" r="3" fill="#FF8FAB" />
        <circle cx="0" cy="-2" r="1.5" fill="white" opacity="0.5" />
      </g>
    </svg>
  );
}

// ── The Treasure Map (s-6-adv-1) ──────────────────────────

function CoverTreasureMap(_: CoverProps) {
  return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="ct-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF3E0" />
          <stop offset="100%" stopColor="#FFE0B2" />
        </linearGradient>
      </defs>
      <rect width="200" height="140" fill="url(#ct-bg)" rx="12" />
      {/* Old parchment map */}
      <g transform="translate(50, 15)">
        <rect x="0" y="0" width="100" height="75" rx="4" fill="#F5E6C8" stroke="#D4A050" strokeWidth="1.5" />
        <rect x="0" y="0" width="100" height="75" rx="4" fill="#D4A050" opacity="0.08" />
        {/* Map details */}
        <path d="M15 20 L35 15 L50 25 L70 18 L85 30" stroke="#8B6914" strokeWidth="1.5" fill="none" strokeDasharray="3 2" />
        <path d="M85 30 L80 50 L85 65" stroke="#8B6914" strokeWidth="1.5" fill="none" strokeDasharray="3 2" />
        {/* Trees on map */}
        <circle cx="30" cy="40" r="4" fill="#6BCB77" opacity="0.5" />
        <circle cx="55" cy="35" r="3" fill="#6BCB77" opacity="0.4" />
        {/* Water on map */}
        <path d="M10 55 Q25 50 40 55 Q55 60 65 55" stroke="#45B7D1" strokeWidth="2" fill="none" opacity="0.4" />
        {/* X marks the spot! */}
        <line x1="78" y1="58" x2="92" y2="72" stroke="#FF6B6B" strokeWidth="3" strokeLinecap="round" />
        <line x1="92" y1="58" x2="78" y2="72" stroke="#FF6B6B" strokeWidth="3" strokeLinecap="round" />
        {/* Compass rose */}
        <circle cx="20" cy="65" r="6" fill="none" stroke="#8B6914" strokeWidth="0.8" />
        <line x1="20" y1="59" x2="20" y2="71" stroke="#8B6914" strokeWidth="0.8" />
        <line x1="14" y1="65" x2="26" y2="65" stroke="#8B6914" strokeWidth="0.8" />
        <text x="18" y="61" fill="#8B6914" fontSize="4" fontWeight="bold">N</text>
      </g>
      {/* Gold coins at bottom */}
      <circle cx="80" cy="110" r="8" fill="#FFD93D" stroke="#E6B800" strokeWidth="1" />
      <circle cx="92" cy="115" r="7" fill="#FFD93D" stroke="#E6B800" strokeWidth="1" />
      <circle cx="72" cy="118" r="6" fill="#FFD93D" stroke="#E6B800" strokeWidth="1" />
      <text x="78" y="113" fill="#8B6914" fontSize="6" fontWeight="bold">$</text>
      <text x="90" y="118" fill="#8B6914" fontSize="5" fontWeight="bold">$</text>
      {/* Compass beside map */}
      <circle cx="170" cy="85" r="15" fill="#E8E0D0" stroke="#8B6914" strokeWidth="1.5" />
      <circle cx="170" cy="85" r="12" fill="#F5F0E5" />
      <polygon points="170,74 172,85 168,85" fill="#FF6B6B" />
      <polygon points="170,96 172,85 168,85" fill="#BDBDBD" />
      <Sparkle x={160} y={25} size={5} />
      <Sparkle x={30} y={105} size={4} />
    </svg>
  );
}

// ── The New Kid (s-6-fri-1) ──────────────────────────────

function CoverNewKid(_: CoverProps) {
  return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="cn-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E3F2FD" />
          <stop offset="100%" stopColor="#BBDEFB" />
        </linearGradient>
      </defs>
      <rect width="200" height="140" fill="url(#cn-bg)" rx="12" />
      {/* School building silhouette */}
      <rect x="55" y="20" width="90" height="55" rx="4" fill="#FFECB3" opacity="0.6" />
      <rect x="60" y="25" width="15" height="12" rx="2" fill="#87CEEB" opacity="0.6" />
      <rect x="80" y="25" width="15" height="12" rx="2" fill="#87CEEB" opacity="0.6" />
      <rect x="100" y="25" width="15" height="12" rx="2" fill="#87CEEB" opacity="0.6" />
      <rect x="120" y="25" width="15" height="12" rx="2" fill="#87CEEB" opacity="0.6" />
      {/* Door */}
      <rect x="88" y="50" width="24" height="25" rx="2" fill="#8D6E63" opacity="0.6" />
      {/* Ground / playground */}
      <rect x="0" y="75" width="200" height="65" rx="0" fill="#A8E6CF" opacity="0.4" />
      {/* Kid 1 (Sam — shy) */}
      <g transform="translate(70, 80)">
        <circle cx="0" cy="0" r="9" fill="#FFE0B2" />
        <circle cx="-3" cy="-1" r="1.5" fill="#2D2D3A" />
        <circle cx="3" cy="-1" r="1.5" fill="#2D2D3A" />
        <path d="M-2 4 Q0 3 2 4" stroke="#2D2D3A" strokeWidth="1" fill="none" />
        {/* Hair */}
        <path d="M-8 -3 Q-8 -10 0 -10 Q8 -10 8 -3" fill="#8B6914" />
        {/* Body */}
        <rect x="-8" y="10" width="16" height="20" rx="4" fill="#4ECDC4" />
        {/* Backpack */}
        <rect x="-12" y="12" width="6" height="14" rx="3" fill="#FF8C42" />
      </g>
      {/* Kid 2 (Emma — waving) */}
      <g transform="translate(130, 80)">
        <circle cx="0" cy="0" r="9" fill="#FFE0B2" />
        <circle cx="-3" cy="-1" r="1.5" fill="#2D2D3A" />
        <circle cx="3" cy="-1" r="1.5" fill="#2D2D3A" />
        <path d="M-3 3 Q0 6 3 3" stroke="#2D2D3A" strokeWidth="1" fill="none" />
        {/* Hair (pigtails) */}
        <path d="M-8 -3 Q-8 -10 0 -10 Q8 -10 8 -3" fill="#5D4037" />
        <circle cx="-10" cy="-4" r="4" fill="#5D4037" />
        <circle cx="10" cy="-4" r="4" fill="#5D4037" />
        {/* Body */}
        <rect x="-8" y="10" width="16" height="20" rx="4" fill="#FF8FAB" />
        {/* Waving arm */}
        <line x1="8" y1="14" x2="18" y2="2" stroke="#FFE0B2" strokeWidth="3" strokeLinecap="round" />
        {/* Hand */}
        <circle cx="18" cy="1" r="3" fill="#FFE0B2" />
      </g>
      {/* Dinosaur drawings floating between them */}
      <g transform="translate(100, 95)" opacity="0.6">
        <path d="M-6 5 L-6 -2 L-3 -5 L0 -3 L3 -5 L6 -2 L6 5 L3 8 L-3 8Z" fill="#6BCB77" />
        <circle cx="-3" cy="-1" r="1" fill="#2D2D3A" />
      </g>
    </svg>
  );
}

// ── The Water Cycle (s-6-nat-1) ──────────────────────────

function CoverWaterCycle(_: CoverProps) {
  return (
    <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="cw-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87CEEB" />
          <stop offset="50%" stopColor="#B0E0F0" />
          <stop offset="100%" stopColor="#C8E6C9" />
        </linearGradient>
      </defs>
      <rect width="200" height="140" fill="url(#cw-sky)" rx="12" />
      {/* Sun */}
      <circle cx="170" cy="25" r="16" fill="#FFE66D" />
      {/* Sun rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line
          key={angle}
          x1={170 + Math.cos((angle * Math.PI) / 180) * 20}
          y1={25 + Math.sin((angle * Math.PI) / 180) * 20}
          x2={170 + Math.cos((angle * Math.PI) / 180) * 26}
          y2={25 + Math.sin((angle * Math.PI) / 180) * 26}
          stroke="#FFE66D"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
        />
      ))}
      {/* Cloud */}
      <ellipse cx="70" cy="30" rx="28" ry="14" fill="white" opacity="0.9" />
      <ellipse cx="55" cy="34" rx="18" ry="10" fill="white" opacity="0.85" />
      <ellipse cx="85" cy="34" rx="18" ry="10" fill="white" opacity="0.85" />
      {/* Rain from cloud */}
      {[55, 65, 75, 85].map((x, i) => (
        <g key={i}>
          <path
            d={`M${x} ${44 + i * 2} L${x - 1} ${52 + i * 2} Q${x} ${55 + i * 2} ${x + 1} ${52 + i * 2}Z`}
            fill="#45B7D1"
            opacity={0.5 + i * 0.1}
          />
        </g>
      ))}
      {/* Evaporation arrows (wavy lines going up) */}
      <path d="M130 95 Q133 85 130 75 Q127 65 130 55" stroke="#45B7D1" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.5" />
      <path d="M140 98 Q143 88 140 78 Q137 68 140 58" stroke="#45B7D1" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity="0.4" />
      {/* Up arrow on evaporation */}
      <polygon points="128,55 130,48 132,55" fill="#45B7D1" opacity="0.5" />
      <polygon points="138,58 140,51 142,58" fill="#45B7D1" opacity="0.4" />
      {/* Ocean / water body */}
      <ellipse cx="100" cy="130" rx="95" ry="22" fill="#45B7D1" opacity="0.35" />
      <path d="M10 118 Q30 114 50 118 Q70 122 90 118 Q110 114 130 118 Q150 122 170 118 Q185 114 195 118" stroke="#45B7D1" strokeWidth="2" fill="none" opacity="0.4" />
      {/* Mountains with snow */}
      <polygon points="10,110 35,60 60,110" fill="#78909C" opacity="0.5" />
      <polygon points="25,110 45,70 65,110" fill="#90A4AE" opacity="0.4" />
      <polygon points="30,75 35,60 40,75" fill="white" opacity="0.6" />
      {/* Cycle arrow */}
      <path d="M85 85 Q60 60 85 40" stroke="#FF8C42" strokeWidth="2" fill="none" opacity="0.5" />
      <polygon points="83,42 85,35 90,42" fill="#FF8C42" opacity="0.5" />
    </svg>
  );
}

// ── Cover Map ──────────────────────────────────────────────

const coverMap: Record<string, (props: CoverProps) => ReactNode> = {
  's-2-bed-1': CoverGoodnightMoon,
  's-2-ani-1': CoverLittleDuck,
  's-2-fri-1': CoverBestFriend,
  's-4-adv-1': CoverMagicGarden,
  's-4-nat-1': CoverRainbow,
  's-4-ani-1': CoverBraveCat,
  's-6-adv-1': CoverTreasureMap,
  's-6-fri-1': CoverNewKid,
  's-6-nat-1': CoverWaterCycle,
};

/**
 * Get the SVG cover illustration for a story by ID.
 * Returns the cover component or null if no cover exists.
 */
export function getStoryCover(storyId: string): ReactNode | null {
  const Cover = coverMap[storyId];
  return Cover ? <Cover /> : null;
}

/**
 * Get list of story IDs that have covers (for debugging).
 */
export function getCoveredStoryIds(): string[] {
  return Object.keys(coverMap);
}
