/**
 * StoryPageArt — Full-page narrative illustrations for the story reader.
 * Each scene is a rich, story-specific SVG designed to fill the book page area.
 * Keyed by storyId:pageIndex for precise narrative continuity.
 * Falls back to null so the caller can use StoryIllustration or emoji.
 */
import { type ReactNode } from 'react';

// ── Shared scene primitives ─────────────────────────────────

const DaySky = () => (
  <defs>
    <linearGradient id="spa-day" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#87CEEB" />
      <stop offset="100%" stopColor="#B8E4F0" />
    </linearGradient>
  </defs>
);

const NightSky = () => (
  <defs>
    <linearGradient id="spa-night" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#0F0A2E" />
      <stop offset="100%" stopColor="#1A1055" />
    </linearGradient>
  </defs>
);

const TinyStar = ({ x, y, r = 2, fill = '#FFE66D' }: { x: number; y: number; r?: number; fill?: string }) => (
  <circle cx={x} cy={y} r={r} fill={fill} opacity="0.8" />
);

const Reeds = ({ x, y }: { x: number; y: number }) => (
  <g transform={`translate(${x},${y})`} aria-hidden="true">
    <line x1="0" y1="0" x2="-2" y2="-18" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" />
    <line x1="5" y1="0" x2="3" y2="-22" stroke="#66BB6A" strokeWidth="2" strokeLinecap="round" />
    <line x1="10" y1="0" x2="12" y2="-16" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" />
    <ellipse cx="3" cy="-24" rx="3" ry="4" fill="#8B6914" opacity="0.5" />
  </g>
);

const LilyPad = ({ x, y, r = 10 }: { x: number; y: number; r?: number }) => (
  <g transform={`translate(${x},${y})`} aria-hidden="true">
    <ellipse cx="0" cy="0" rx={r} ry={r * 0.4} fill="#6BCB77" opacity="0.7" />
    <line x1="0" y1={-r * 0.4} x2="0" y2="0" stroke="#4CAF50" strokeWidth="0.8" opacity="0.4" />
  </g>
);

const WaterRipple = ({ x, y, w = 20 }: { x: number; y: number; w?: number }) => (
  <path
    d={`M${x - w / 2} ${y} Q${x - w / 4} ${y - 2} ${x} ${y} Q${x + w / 4} ${y + 2} ${x + w / 2} ${y}`}
    stroke="#45B7D1" strokeWidth="1" fill="none" opacity="0.4"
    aria-hidden="true"
  />
);

// ═══════════════════════════════════════════════════════════
// THE LITTLE DUCK — 5 pages
// ═══════════════════════════════════════════════════════════

/** Page 1: A little duck lived by a big blue pond */
function DuckPage1() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <DaySky />
      <rect width="300" height="220" fill="url(#spa-day)" />
      {/* Clouds */}
      <ellipse cx="60" cy="30" rx="28" ry="12" fill="white" opacity="0.85" />
      <ellipse cx="45" cy="34" rx="18" ry="9" fill="white" opacity="0.75" />
      <ellipse cx="220" cy="25" rx="22" ry="10" fill="white" opacity="0.7" />
      {/* Sun */}
      <circle cx="260" cy="35" r="20" fill="#FFE66D" />
      <circle cx="260" cy="35" r="28" fill="#FFE66D" opacity="0.1" />
      {/* Far hills */}
      <ellipse cx="80" cy="130" rx="100" ry="30" fill="#A8E6CF" opacity="0.5" />
      <ellipse cx="230" cy="135" rx="80" ry="25" fill="#A8E6CF" opacity="0.4" />
      {/* Pond */}
      <ellipse cx="150" cy="180" rx="140" ry="45" fill="#45B7D1" opacity="0.35" />
      <ellipse cx="150" cy="175" rx="130" ry="38" fill="#87CEEB" opacity="0.25" />
      {/* Reeds */}
      <Reeds x={30} y={155} />
      <Reeds x={260} y={160} />
      {/* Lily pads */}
      <LilyPad x={80} y={175} r={12} />
      <LilyPad x={210} y={180} r={10} />
      <LilyPad x={140} y={190} r={8} />
      {/* Duck — larger, centered, looking at pond */}
      <g transform="translate(145, 135)">
        {/* Body */}
        <ellipse cx="0" cy="12" rx="24" ry="16" fill="#FFE066" />
        {/* Wing */}
        <path d="M-16 8 Q-10 0 0 6 Q-8 14 -16 8Z" fill="#E6C84A" />
        {/* Head */}
        <circle cx="20" cy="-2" r="14" fill="#FFE066" />
        {/* Eye */}
        <circle cx="26" cy="-6" r="3" fill="#2D2D3A" />
        <circle cx="27" cy="-7" r="1" fill="white" />
        {/* Bill */}
        <ellipse cx="36" cy="0" rx="9" ry="3.5" fill="#FF8C42" />
        {/* Cheek blush */}
        <circle cx="22" cy="3" r="3" fill="#FFAA70" opacity="0.3" />
        {/* Feet */}
        <path d="M-8 28 L-14 32 L-8 30 L-2 32 L-8 28" fill="#FF8C42" />
        <path d="M8 28 L2 32 L8 30 L14 32 L8 28" fill="#FF8C42" />
      </g>
      {/* Water ripples near duck */}
      <WaterRipple x={130} y={170} w={25} />
      <WaterRipple x={170} y={175} w={20} />
      {/* Dragonfly */}
      <g transform="translate(55, 110)" aria-hidden="true">
        <ellipse cx="0" cy="0" rx="1.5" ry="5" fill="#45B7D1" />
        <ellipse cx="-5" cy="-2" rx="5" ry="2" fill="#87CEEB" opacity="0.6" />
        <ellipse cx="5" cy="-2" rx="5" ry="2" fill="#87CEEB" opacity="0.6" />
      </g>
    </svg>
  );
}

/** Page 2: Quack quack! said the duck. Let me swim! */
function DuckPage2() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <DaySky />
      <rect width="300" height="220" fill="url(#spa-day)" />
      {/* Clouds */}
      <ellipse cx="80" cy="28" rx="24" ry="10" fill="white" opacity="0.8" />
      <ellipse cx="200" cy="22" rx="20" ry="9" fill="white" opacity="0.7" />
      {/* Pond fills more of the scene */}
      <ellipse cx="150" cy="160" rx="150" ry="65" fill="#45B7D1" opacity="0.35" />
      <ellipse cx="150" cy="155" rx="140" ry="55" fill="#87CEEB" opacity="0.2" />
      {/* Reeds on edges */}
      <Reeds x={15} y={130} />
      <Reeds x={275} y={135} />
      {/* Duck swimming — lower in water */}
      <g transform="translate(130, 120)">
        {/* Body (half in water) */}
        <ellipse cx="0" cy="8" rx="26" ry="14" fill="#FFE066" />
        {/* Tail feather */}
        <path d="M-24 2 L-34 -8 L-26 0" fill="#E6C84A" />
        {/* Head up, excited */}
        <circle cx="22" cy="-8" r="14" fill="#FFE066" />
        {/* Eye — bigger, happy */}
        <circle cx="28" cy="-12" r="3" fill="#2D2D3A" />
        <circle cx="29" cy="-13" r="1" fill="white" />
        {/* Open bill — quacking */}
        <path d="M34 -6 L46 -10 L46 -4Z" fill="#FF8C42" />
        <path d="M34 -4 L46 -2 L46 -4Z" fill="#E67E22" />
        {/* Cheek blush */}
        <circle cx="24" cy="-1" r="3" fill="#FFAA70" opacity="0.3" />
      </g>
      {/* Speech — "Quack!" */}
      <g transform="translate(185, 85)" aria-hidden="true">
        <rect x="0" y="0" width="60" height="24" rx="12" fill="white" opacity="0.9" />
        <text x="30" y="16" textAnchor="middle" fill="#FF8C42" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Quack!</text>
        <polygon points="10,24 18,24 8,32" fill="white" opacity="0.9" />
      </g>
      {/* Big splash waves */}
      <WaterRipple x={100} y={150} w={30} />
      <WaterRipple x={160} y={145} w={25} />
      <WaterRipple x={120} y={155} w={20} />
      {/* Splash droplets */}
      <circle cx="95" cy="115" r="2.5" fill="#87CEEB" opacity="0.5" />
      <circle cx="170" cy="110" r="2" fill="#87CEEB" opacity="0.4" />
      <circle cx="108" cy="108" r="1.5" fill="#87CEEB" opacity="0.3" />
      {/* Lily pads */}
      <LilyPad x={50} y={160} />
      <LilyPad x={240} y={165} r={8} />
    </svg>
  );
}

/** Page 3: The duck met a frog. Ribbit! said the frog. */
function DuckPage3() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <DaySky />
      <rect width="300" height="220" fill="url(#spa-day)" />
      {/* Pond */}
      <ellipse cx="150" cy="170" rx="150" ry="55" fill="#45B7D1" opacity="0.35" />
      {/* Lily pad where frog sits */}
      <ellipse cx="95" cy="140" rx="20" ry="8" fill="#6BCB77" />
      <ellipse cx="95" cy="140" rx="18" ry="7" fill="#7DD88A" opacity="0.5" />
      {/* Frog on lily pad */}
      <g transform="translate(95, 120)">
        {/* Body */}
        <ellipse cx="0" cy="10" rx="14" ry="10" fill="#6BCB77" />
        {/* Head */}
        <circle cx="0" cy="-2" r="11" fill="#7DD88A" />
        {/* Big eyes */}
        <circle cx="-6" cy="-8" r="5" fill="white" />
        <circle cx="6" cy="-8" r="5" fill="white" />
        <circle cx="-5" cy="-8" r="3" fill="#2D2D3A" />
        <circle cx="7" cy="-8" r="3" fill="#2D2D3A" />
        <circle cx="-4" cy="-9" r="1" fill="white" />
        <circle cx="8" cy="-9" r="1" fill="white" />
        {/* Smile */}
        <path d="M-5 3 Q0 7 5 3" stroke="#4CAF50" strokeWidth="1.2" fill="none" />
        {/* Front legs */}
        <path d="M-12 15 L-18 18 L-14 18 L-10 18" stroke="#6BCB77" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M12 15 L18 18 L14 18 L10 18" stroke="#6BCB77" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Cheek spots */}
        <circle cx="-8" cy="0" r="2.5" fill="#FFE66D" opacity="0.3" />
        <circle cx="8" cy="0" r="2.5" fill="#FFE66D" opacity="0.3" />
      </g>
      {/* Frog speech — "Ribbit!" */}
      <g transform="translate(40, 90)" aria-hidden="true">
        <rect x="0" y="0" width="55" height="22" rx="11" fill="white" opacity="0.9" />
        <text x="28" y="15" textAnchor="middle" fill="#4CAF50" fontSize="10" fontWeight="bold" fontFamily="sans-serif">Ribbit!</text>
        <polygon points="42,22 48,22 50,30" fill="white" opacity="0.9" />
      </g>
      {/* Duck swimming toward frog */}
      <g transform="translate(200, 130)">
        <ellipse cx="0" cy="8" rx="22" ry="13" fill="#FFE066" />
        <path d="M20 2 L28 -6 L22 0" fill="#E6C84A" />
        <circle cx="-16" cy="-4" r="12" fill="#FFE066" />
        <circle cx="-22" cy="-8" r="2.5" fill="#2D2D3A" />
        <circle cx="-23" cy="-9" r="0.8" fill="white" />
        <ellipse cx="-28" cy="-4" rx="7" ry="3" fill="#FF8C42" />
        <circle cx="-18" cy="1" r="2.5" fill="#FFAA70" opacity="0.3" />
      </g>
      {/* Water ripples */}
      <WaterRipple x={180} y={158} w={22} />
      <WaterRipple x={120} y={165} w={18} />
      {/* Reeds */}
      <Reeds x={270} y={145} />
      {/* Butterfly */}
      <g transform="translate(250, 60)" aria-hidden="true">
        <ellipse cx="0" cy="0" rx="1" ry="3" fill="#2D2D3A" />
        <ellipse cx="-4" cy="-2" rx="4" ry="3" fill="#FF8FAB" opacity="0.7" />
        <ellipse cx="4" cy="-2" rx="4" ry="3" fill="#A78BFA" opacity="0.7" />
      </g>
    </svg>
  );
}

/** Page 4: They splashed and played in the sun. */
function DuckPage4() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <DaySky />
      <rect width="300" height="220" fill="url(#spa-day)" />
      {/* Big bright sun */}
      <circle cx="150" cy="30" r="26" fill="#FFE66D" />
      <circle cx="150" cy="30" r="35" fill="#FFE66D" opacity="0.12" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line
          key={a}
          x1={150 + Math.cos((a * Math.PI) / 180) * 30}
          y1={30 + Math.sin((a * Math.PI) / 180) * 30}
          x2={150 + Math.cos((a * Math.PI) / 180) * 38}
          y2={30 + Math.sin((a * Math.PI) / 180) * 38}
          stroke="#FFE66D" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"
        />
      ))}
      {/* Pond */}
      <ellipse cx="150" cy="170" rx="150" ry="60" fill="#45B7D1" opacity="0.35" />
      {/* Splash effect center */}
      <g transform="translate(150, 130)" aria-hidden="true">
        {/* Big splash ring */}
        <ellipse cx="0" cy="15" rx="40" ry="10" fill="none" stroke="#87CEEB" strokeWidth="1.5" opacity="0.4" />
        <ellipse cx="0" cy="15" rx="28" ry="7" fill="none" stroke="#87CEEB" strokeWidth="1" opacity="0.3" />
        {/* Water drops flying up */}
        <circle cx="-20" cy="-10" r="3" fill="#87CEEB" opacity="0.5" />
        <circle cx="18" cy="-15" r="2.5" fill="#87CEEB" opacity="0.4" />
        <circle cx="-8" cy="-20" r="2" fill="#87CEEB" opacity="0.35" />
        <circle cx="12" cy="-25" r="1.5" fill="#87CEEB" opacity="0.3" />
        <circle cx="-25" cy="-5" r="2" fill="#87CEEB" opacity="0.3" />
        <circle cx="28" cy="-8" r="2.5" fill="#87CEEB" opacity="0.4" />
      </g>
      {/* Duck splashing — left */}
      <g transform="translate(120, 120)">
        <ellipse cx="0" cy="10" rx="20" ry="12" fill="#FFE066" />
        <circle cx="-14" cy="-2" r="11" fill="#FFE066" />
        <circle cx="-18" cy="-6" r="2.5" fill="#2D2D3A" />
        <circle cx="-19" cy="-7" r="0.8" fill="white" />
        <ellipse cx="-26" cy="-2" rx="6" ry="2.5" fill="#FF8C42" />
        {/* Happy open bill */}
        <path d="M-22 0 Q-20 3 -18 0" stroke="#E67E22" strokeWidth="1" fill="none" />
        {/* Wing up — splashing */}
        <path d="M10 2 Q18 -10 8 -5 Q14 -8 10 2" fill="#E6C84A" />
      </g>
      {/* Frog splashing — right */}
      <g transform="translate(185, 125)">
        <ellipse cx="0" cy="8" rx="12" ry="9" fill="#6BCB77" />
        <circle cx="0" cy="-4" r="10" fill="#7DD88A" />
        <circle cx="-5" cy="-8" r="4" fill="white" />
        <circle cx="5" cy="-8" r="4" fill="white" />
        <circle cx="-4" cy="-8" r="2.5" fill="#2D2D3A" />
        <circle cx="6" cy="-8" r="2.5" fill="#2D2D3A" />
        <path d="M-4 2 Q0 5 4 2" stroke="#4CAF50" strokeWidth="1" fill="none" />
        {/* Legs out — jumping */}
        <path d="M-10 12 L-18 18" stroke="#6BCB77" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M10 12 L18 18" stroke="#6BCB77" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      {/* Lily pads scattered */}
      <LilyPad x={40} y={170} r={10} />
      <LilyPad x={260} y={175} r={8} />
      <Reeds x={10} y={145} />
    </svg>
  );
}

/** Page 5: What a fun day! said the little duck. */
function DuckPage5() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <DaySky />
      <rect width="300" height="220" fill="url(#spa-day)" />
      {/* Late afternoon sun — warm golden */}
      <circle cx="250" cy="40" r="22" fill="#FFD93D" />
      <circle cx="250" cy="40" r="30" fill="#FFD93D" opacity="0.1" />
      {/* Warm cloud */}
      <ellipse cx="80" cy="30" rx="26" ry="11" fill="white" opacity="0.7" />
      <ellipse cx="180" cy="22" rx="20" ry="9" fill="#FFF8F0" opacity="0.5" />
      {/* Pond — calmer */}
      <ellipse cx="150" cy="175" rx="140" ry="50" fill="#45B7D1" opacity="0.3" />
      {/* Grassy bank */}
      <ellipse cx="70" cy="150" rx="50" ry="15" fill="#6BCB77" opacity="0.6" />
      {/* Duck on bank, happy */}
      <g transform="translate(80, 118)">
        <ellipse cx="0" cy="14" rx="24" ry="16" fill="#FFE066" />
        <circle cx="18" cy="0" r="14" fill="#FFE066" />
        {/* Happy squinting eyes */}
        <path d="M13 -4 Q16 -7 19 -4" stroke="#2D2D3A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <path d="M21 -4 Q24 -7 27 -4" stroke="#2D2D3A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Big smile */}
        <path d="M16 4 Q22 10 28 4" stroke="#2D2D3A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        {/* Bill */}
        <ellipse cx="34" cy="2" rx="8" ry="3" fill="#FF8C42" />
        {/* Rosy cheeks */}
        <circle cx="16" cy="4" r="3.5" fill="#FFAA70" opacity="0.3" />
        <circle cx="28" cy="4" r="3.5" fill="#FFAA70" opacity="0.3" />
        {/* Wing up waving */}
        <path d="M-16 8 Q-20 -2 -10 0 Q-18 4 -16 8" fill="#E6C84A" />
        {/* Feet */}
        <path d="M-8 30 L-14 34 L-8 32 L-2 34 L-8 30" fill="#FF8C42" />
        <path d="M8 30 L2 34 L8 32 L14 34 L8 30" fill="#FF8C42" />
      </g>
      {/* Frog sitting nearby on lily pad */}
      <LilyPad x={180} y={160} r={16} />
      <g transform="translate(180, 145)">
        <ellipse cx="0" cy="6" rx="10" ry="8" fill="#6BCB77" />
        <circle cx="0" cy="-4" r="8" fill="#7DD88A" />
        <circle cx="-4" cy="-7" r="3" fill="white" />
        <circle cx="4" cy="-7" r="3" fill="white" />
        <circle cx="-3" cy="-7" r="2" fill="#2D2D3A" />
        <circle cx="5" cy="-7" r="2" fill="#2D2D3A" />
        {/* Frog waving */}
        <line x1="10" y1="0" x2="16" y2="-8" stroke="#6BCB77" strokeWidth="2" strokeLinecap="round" />
        <circle cx="17" cy="-9" r="2" fill="#7DD88A" />
      </g>
      {/* Flowers on bank */}
      {[30, 55, 110].map((x, i) => (
        <g key={i} transform={`translate(${x}, ${140 + (i % 2) * 4})`} aria-hidden="true">
          <rect x="-0.5" y="0" width="1.5" height="8" fill="#4CAF50" />
          <circle cx="0" cy="-2" r="3" fill={['#FF8FAB', '#FFE66D', '#A78BFA'][i]} />
          <circle cx="0" cy="-2" r="1.5" fill="white" opacity="0.4" />
        </g>
      ))}
      {/* Reeds */}
      <Reeds x={260} y={150} />
      {/* Water reflections */}
      <WaterRipple x={160} y={180} w={20} />
      <WaterRipple x={220} y={185} w={15} />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════
// GOODNIGHT MOON — 5 pages
// ═══════════════════════════════════════════════════════════

/** Page 1: The big round moon came out to play */
function MoonPage1() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <NightSky />
      <rect width="300" height="220" fill="url(#spa-night)" />
      {/* Big luminous moon */}
      <circle cx="150" cy="80" r="45" fill="#FFF8DC" />
      <circle cx="150" cy="80" r="55" fill="#FFF8DC" opacity="0.06" />
      <circle cx="150" cy="80" r="65" fill="#FFF8DC" opacity="0.03" />
      {/* Moon craters (gentle) */}
      <circle cx="135" cy="72" r="6" fill="#F5E6C8" opacity="0.3" />
      <circle cx="158" cy="90" r="4" fill="#F5E6C8" opacity="0.25" />
      <circle cx="145" cy="95" r="3" fill="#F5E6C8" opacity="0.2" />
      {/* Stars */}
      <TinyStar x={40} y={30} r={2.5} />
      <TinyStar x={80} y={55} r={1.5} />
      <TinyStar x={260} y={25} r={2} />
      <TinyStar x={220} y={50} r={1.5} />
      <TinyStar x={30} y={70} r={1} />
      <TinyStar x={275} y={80} r={2} />
      <TinyStar x={180} y={20} r={1.5} />
      {/* Dark hills */}
      <ellipse cx="80" cy="220" rx="120" ry="50" fill="#0D0825" />
      <ellipse cx="230" cy="220" rx="100" ry="45" fill="#0D0825" opacity="0.8" />
      {/* Silhouette trees */}
      <g opacity="0.6" aria-hidden="true">
        <rect x="55" y="160" width="6" height="25" fill="#0D0825" />
        <ellipse cx="58" cy="155" rx="15" ry="18" fill="#0D0825" />
        <rect x="230" y="165" width="5" height="22" fill="#0D0825" />
        <ellipse cx="232" cy="160" rx="12" ry="15" fill="#0D0825" />
      </g>
    </svg>
  );
}

/** Page 2: Goodnight stars, goodnight sky */
function MoonPage2() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <NightSky />
      <rect width="300" height="220" fill="url(#spa-night)" />
      {/* Many stars — the sky is the focus */}
      <TinyStar x={30} y={20} r={3} />
      <TinyStar x={70} y={45} r={2.5} />
      <TinyStar x={110} y={25} r={3.5} />
      <TinyStar x={150} y={50} r={2} />
      <TinyStar x={190} y={30} r={3} />
      <TinyStar x={230} y={55} r={2.5} />
      <TinyStar x={270} y={20} r={2} />
      <TinyStar x={50} y={80} r={2} />
      <TinyStar x={100} y={70} r={1.5} />
      <TinyStar x={200} y={75} r={2} />
      <TinyStar x={260} y={90} r={1.5} />
      <TinyStar x={140} y={95} r={2.5} />
      <TinyStar x={80} y={105} r={1.5} />
      <TinyStar x={180} y={110} r={2} />
      {/* Small crescent moon in corner */}
      <circle cx="40" cy="35" r="14" fill="#FFF8DC" />
      <circle cx="48" cy="30" r="14" fill="url(#spa-night)" />
      {/* Constellation — connect-the-dots pattern */}
      <line x1="110" y1="25" x2="150" y2="50" stroke="#FFF8DC" strokeWidth="0.5" opacity="0.2" />
      <line x1="150" y1="50" x2="190" y2="30" stroke="#FFF8DC" strokeWidth="0.5" opacity="0.2" />
      <line x1="190" y1="30" x2="230" y2="55" stroke="#FFF8DC" strokeWidth="0.5" opacity="0.2" />
      {/* Milky Way band */}
      <ellipse cx="150" cy="130" rx="160" ry="20" fill="#C4AAFF" opacity="0.04" />
      {/* Dark ground */}
      <ellipse cx="150" cy="220" rx="160" ry="30" fill="#0D0825" />
    </svg>
  );
}

/** Page 3: Goodnight trees, standing so high */
function MoonPage3() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <NightSky />
      <rect width="300" height="220" fill="url(#spa-night)" />
      {/* Moon glow — top right */}
      <circle cx="260" cy="35" r="16" fill="#FFF8DC" />
      <circle cx="260" cy="35" r="22" fill="#FFF8DC" opacity="0.06" />
      {/* Stars */}
      <TinyStar x={40} y={25} r={2} />
      <TinyStar x={120} y={20} r={1.5} />
      <TinyStar x={200} y={15} r={2} />
      {/* Three big trees — silhouette with gentle color */}
      {/* Tree 1 */}
      <rect x="50" y="100" width="10" height="80" rx="3" fill="#2A1F0D" />
      <ellipse cx="55" cy="85" rx="30" ry="35" fill="#1A4A2A" />
      <ellipse cx="45" cy="90" rx="20" ry="25" fill="#1F5A30" opacity="0.7" />
      {/* Tree 2 — tallest */}
      <rect x="140" y="70" width="12" height="100" rx="3" fill="#2A1F0D" />
      <ellipse cx="146" cy="55" rx="35" ry="40" fill="#1A4A2A" />
      <ellipse cx="155" cy="62" rx="25" ry="30" fill="#1F5A30" opacity="0.7" />
      {/* Tree 3 */}
      <rect x="230" y="90" width="10" height="85" rx="3" fill="#2A1F0D" />
      <ellipse cx="235" cy="76" rx="28" ry="32" fill="#1A4A2A" />
      <ellipse cx="240" cy="82" rx="18" ry="22" fill="#1F5A30" opacity="0.7" />
      {/* Fireflies */}
      <circle cx="80" cy="110" r="2" fill="#FFE66D" opacity="0.6" />
      <circle cx="180" cy="95" r="1.5" fill="#FFE66D" opacity="0.5" />
      <circle cx="265" cy="105" r="2" fill="#FFE66D" opacity="0.4" />
      <circle cx="110" cy="130" r="1.5" fill="#FFE66D" opacity="0.5" />
      {/* Ground */}
      <ellipse cx="150" cy="220" rx="160" ry="40" fill="#0D1A10" />
    </svg>
  );
}

/** Page 4: Goodnight birds, tucked in your nest */
function MoonPage4() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <NightSky />
      <rect width="300" height="220" fill="url(#spa-night)" />
      {/* Moon */}
      <circle cx="240" cy="40" r="14" fill="#FFF8DC" />
      {/* Stars */}
      <TinyStar x={60} y={20} r={2} />
      <TinyStar x={140} y={30} r={1.5} />
      <TinyStar x={180} y={18} r={2} />
      {/* Big tree with nest */}
      <rect x="100" y="60" width="14" height="120" rx="4" fill="#3E2723" />
      {/* Branch going right */}
      <path d="M114 90 Q150 85 180 95" stroke="#3E2723" strokeWidth="6" fill="none" strokeLinecap="round" />
      {/* Branch going left */}
      <path d="M100 110 Q70 105 50 115" stroke="#3E2723" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* Tree canopy */}
      <ellipse cx="107" cy="55" rx="40" ry="35" fill="#1A4A2A" />
      <ellipse cx="95" cy="60" rx="28" ry="25" fill="#1F5A30" opacity="0.7" />
      {/* Nest on right branch */}
      <ellipse cx="160" cy="88" rx="22" ry="8" fill="#8B6914" />
      <path d="M140 88 Q145 80 150 85 Q155 78 160 84 Q165 78 170 85 Q175 80 180 88" stroke="#6D4C13" strokeWidth="1.5" fill="none" />
      {/* Three baby birds sleeping in nest */}
      <g transform="translate(148, 76)">
        <circle cx="0" cy="0" r="5" fill="#FFE066" />
        <path d="M-2 -2 Q0 -4 2 -2" stroke="#2D2D3A" strokeWidth="0.8" fill="none" />
      </g>
      <g transform="translate(160, 74)">
        <circle cx="0" cy="0" r="5.5" fill="#87CEEB" opacity="0.8" />
        <path d="M-2 -2 Q0 -4 2 -2" stroke="#2D2D3A" strokeWidth="0.8" fill="none" />
      </g>
      <g transform="translate(172, 76)">
        <circle cx="0" cy="0" r="5" fill="#FFB6C1" />
        <path d="M-2 -2 Q0 -4 2 -2" stroke="#2D2D3A" strokeWidth="0.8" fill="none" />
      </g>
      {/* Parent bird on branch */}
      <g transform="translate(55, 105)">
        <ellipse cx="0" cy="0" rx="8" ry="6" fill="#45B7D1" />
        <circle cx="-6" cy="-5" r="5" fill="#45B7D1" />
        <circle cx="-8" cy="-7" r="1.5" fill="white" />
        <circle cx="-8" cy="-7" r="0.8" fill="#2D2D3A" />
        <path d="M-2 -3 Q0 -5 2 -3" stroke="#2D2D3A" strokeWidth="0.8" fill="none" />
        <polygon points="-12,-5 -15,-6 -12,-4" fill="#FF8C42" />
        {/* Wing tucked */}
        <path d="M4 -2 Q8 -6 6 0" fill="#3A9BC4" />
      </g>
      {/* Ground */}
      <ellipse cx="150" cy="220" rx="160" ry="35" fill="#0D1A10" />
    </svg>
  );
}

/** Page 5: Close your eyes, it is time to rest */
function MoonPage5() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <NightSky />
      <rect width="300" height="220" fill="url(#spa-night)" />
      {/* Soft moon glow */}
      <circle cx="150" cy="60" r="30" fill="#FFF8DC" opacity="0.08" />
      <circle cx="150" cy="60" r="20" fill="#FFF8DC" opacity="0.12" />
      {/* Gentle stars */}
      <TinyStar x={50} y={30} r={1.5} />
      <TinyStar x={100} y={20} r={2} />
      <TinyStar x={200} y={25} r={1.5} />
      <TinyStar x={250} y={40} r={2} />
      <TinyStar x={70} y={60} r={1} />
      <TinyStar x={230} y={55} r={1} />
      {/* Cozy bedroom window */}
      <rect x="100" y="80" width="100" height="80" rx="6" fill="#2D1B69" opacity="0.6" />
      <rect x="105" y="85" width="90" height="70" rx="4" fill="#1A1040" />
      {/* Window panes */}
      <line x1="150" y1="85" x2="150" y2="155" stroke="#2D1B69" strokeWidth="2" opacity="0.6" />
      <line x1="105" y1="120" x2="195" y2="120" stroke="#2D1B69" strokeWidth="2" opacity="0.6" />
      {/* Stars visible through window */}
      <TinyStar x={120} y={100} r={1.5} fill="#FFE66D" />
      <TinyStar x={170} y={95} r={1} fill="#FFE66D" />
      <TinyStar x={135} y={108} r={1} fill="#FFE66D" />
      {/* Moon through window */}
      <circle cx="180" cy="100" r="8" fill="#FFF8DC" opacity="0.7" />
      <circle cx="183" cy="98" r="8" fill="#1A1040" />
      {/* Sleeping child silhouette (below window = bed area) */}
      <ellipse cx="150" cy="185" rx="50" ry="15" fill="#3D2D69" opacity="0.3" />
      {/* Blanket */}
      <path d="M100 175 Q120 165 150 168 Q180 165 200 175 Q200 200 150 200 Q100 200 100 175Z" fill="#A78BFA" opacity="0.2" />
      {/* Pillow */}
      <ellipse cx="120" cy="175" rx="18" ry="8" fill="white" opacity="0.15" />
      {/* Curtains */}
      <path d="M100 80 Q95 120 100 160" stroke="#C4AAFF" strokeWidth="3" fill="none" opacity="0.15" />
      <path d="M200 80 Q205 120 200 160" stroke="#C4AAFF" strokeWidth="3" fill="none" opacity="0.15" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════
// MY BEST FRIEND — 5 pages
// ═══════════════════════════════════════════════════════════

/** Page 1: Teddy Bear had a best friend named Bunny */
function FriendPage1() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <rect width="300" height="220" rx="0" fill="#FFF0F5" />
      {/* Soft pink room background */}
      <rect x="0" y="140" width="300" height="80" fill="#FFE4EC" opacity="0.5" />
      {/* Window */}
      <rect x="200" y="20" width="60" height="50" rx="4" fill="white" opacity="0.6" />
      <line x1="230" y1="20" x2="230" y2="70" stroke="#FFD1DC" strokeWidth="1.5" />
      <line x1="200" y1="45" x2="260" y2="45" stroke="#FFD1DC" strokeWidth="1.5" />
      {/* Sun through window */}
      <circle cx="240" cy="35" r="8" fill="#FFE66D" opacity="0.5" />
      {/* Teddy bear — left */}
      <g transform="translate(100, 100)">
        <circle cx="0" cy="20" r="24" fill="#D4A574" />
        <circle cx="0" cy="-2" r="18" fill="#D4A574" />
        <circle cx="-14" cy="-16" r="7" fill="#C0956A" />
        <circle cx="-14" cy="-16" r="4" fill="#E8C5A0" />
        <circle cx="14" cy="-16" r="7" fill="#C0956A" />
        <circle cx="14" cy="-16" r="4" fill="#E8C5A0" />
        <circle cx="-6" cy="-6" r="2.5" fill="#2D2D3A" />
        <circle cx="6" cy="-6" r="2.5" fill="#2D2D3A" />
        <circle cx="-5" cy="-7" r="0.8" fill="white" />
        <circle cx="7" cy="-7" r="0.8" fill="white" />
        <ellipse cx="0" cy="4" rx="3.5" ry="2.5" fill="#8B6914" />
        <path d="M-4 7 Q0 11 4 7" stroke="#8B6914" strokeWidth="1.2" fill="none" />
        {/* Tummy */}
        <ellipse cx="0" cy="22" rx="14" ry="12" fill="#E8C5A0" opacity="0.4" />
      </g>
      {/* Bunny — right */}
      <g transform="translate(200, 95)">
        <circle cx="0" cy="20" r="22" fill="#F5F5F5" />
        <circle cx="0" cy="0" r="16" fill="#F5F5F5" />
        <ellipse cx="-8" cy="-28" rx="6" ry="18" fill="#F5F5F5" />
        <ellipse cx="-8" cy="-28" rx="3.5" ry="14" fill="#FFB6C1" opacity="0.4" />
        <ellipse cx="8" cy="-28" rx="6" ry="18" fill="#F5F5F5" />
        <ellipse cx="8" cy="-28" rx="3.5" ry="14" fill="#FFB6C1" opacity="0.4" />
        <circle cx="-5" cy="-4" r="2.5" fill="#FF6B6B" />
        <circle cx="5" cy="-4" r="2.5" fill="#FF6B6B" />
        <ellipse cx="0" cy="2" rx="2.5" ry="2" fill="#FFB6C1" />
        <path d="M-3 5 Q0 8 3 5" stroke="#2D2D3A" strokeWidth="1" fill="none" />
        {/* Fluffy tail */}
        <circle cx="18" cy="25" r="6" fill="#F5F5F5" />
      </g>
      {/* Hearts between them */}
      <path d="M150 80 C150 77 153 76 154 78 C155 76 158 77 158 80 C158 84 154 86 154 86 C154 86 150 84 150 80Z" fill="#FF8FAB" opacity="0.5" />
    </svg>
  );
}

/** Page 2: They liked to play together every day */
function FriendPage2() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <rect width="300" height="220" fill="#E8F5E9" />
      {/* Outdoor grass */}
      <ellipse cx="150" cy="200" rx="160" ry="35" fill="#6BCB77" opacity="0.5" />
      <ellipse cx="150" cy="195" rx="150" ry="30" fill="#A8E6CF" opacity="0.4" />
      {/* Sky */}
      <ellipse cx="60" cy="20" rx="22" ry="10" fill="white" opacity="0.6" />
      <circle cx="260" cy="25" r="16" fill="#FFE66D" opacity="0.5" />
      {/* Ball between them */}
      <circle cx="150" cy="150" r="14" fill="#FF6B6B" />
      <circle cx="150" cy="150" r="10" fill="#FF8FAB" opacity="0.3" />
      <path d="M144 140 Q150 148 156 140" stroke="white" strokeWidth="1.5" opacity="0.4" fill="none" />
      {/* Teddy running left */}
      <g transform="translate(100, 120)">
        <ellipse cx="0" cy="12" rx="18" ry="14" fill="#D4A574" />
        <circle cx="8" cy="-4" r="12" fill="#D4A574" />
        <circle cx="-4" cy="-14" r="5" fill="#C0956A" />
        <circle cx="4" cy="-14" r="5" fill="#C0956A" />
        <circle cx="4" cy="-6" r="2" fill="#2D2D3A" />
        <circle cx="12" cy="-6" r="2" fill="#2D2D3A" />
        <path d="M6 0 Q10 3 14 0" stroke="#8B6914" strokeWidth="1" fill="none" />
        {/* Arms reaching */}
        <line x1="14" y1="4" x2="28" y2="10" stroke="#D4A574" strokeWidth="4" strokeLinecap="round" />
      </g>
      {/* Bunny running right */}
      <g transform="translate(200, 115)">
        <ellipse cx="0" cy="12" rx="16" ry="12" fill="#F5F5F5" />
        <circle cx="-8" cy="-2" r="10" fill="#F5F5F5" />
        <ellipse cx="-12" cy="-18" rx="4" ry="12" fill="#F5F5F5" />
        <ellipse cx="-4" cy="-18" rx="4" ry="12" fill="#F5F5F5" />
        <circle cx="-10" cy="-4" r="2" fill="#FF6B6B" />
        <circle cx="-4" cy="-4" r="2" fill="#FF6B6B" />
        <path d="M-10 1 Q-7 4 -4 1" stroke="#2D2D3A" strokeWidth="1" fill="none" />
        {/* Arms reaching */}
        <line x1="-14" y1="4" x2="-28" y2="10" stroke="#F5F5F5" strokeWidth="4" strokeLinecap="round" />
      </g>
      {/* Flowers */}
      {[40, 260].map((x, i) => (
        <g key={i} transform={`translate(${x}, ${175 + i * 3})`} aria-hidden="true">
          <rect x="-0.5" y="0" width="1.5" height="8" fill="#4CAF50" />
          <circle cx="0" cy="-2" r="3" fill={['#FFE66D', '#FF8FAB'][i]} />
        </g>
      ))}
    </svg>
  );
}

/** Page 3: Teddy shared his cookies with Bunny */
function FriendPage3() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <rect width="300" height="220" fill="#FFF8F0" />
      {/* Picnic blanket */}
      <g transform="translate(60, 110)" aria-hidden="true">
        <path d="M0 0 L180 0 L170 60 L-10 60Z" fill="#FF6B6B" opacity="0.15" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={i * 30} y="0" width="15" height="60" fill="#FF6B6B" opacity="0.08" />
        ))}
      </g>
      {/* Cookie plate in center */}
      <ellipse cx="150" cy="145" rx="25" ry="8" fill="#E0E0E0" />
      <ellipse cx="150" cy="143" rx="22" ry="6" fill="#F5F5F5" />
      {/* Cookies */}
      <circle cx="142" cy="138" r="8" fill="#D4A050" />
      <circle cx="140" cy="136" r="1.5" fill="#5D4037" opacity="0.5" />
      <circle cx="144" cy="139" r="1" fill="#5D4037" opacity="0.4" />
      <circle cx="158" cy="138" r="7" fill="#D4A050" />
      <circle cx="156" cy="136" r="1.5" fill="#5D4037" opacity="0.5" />
      <circle cx="160" cy="139" r="1" fill="#5D4037" opacity="0.4" />
      {/* Teddy — offering cookie */}
      <g transform="translate(90, 95)">
        <circle cx="0" cy="16" r="20" fill="#D4A574" />
        <circle cx="0" cy="-2" r="14" fill="#D4A574" />
        <circle cx="-10" cy="-12" r="5" fill="#C0956A" />
        <circle cx="10" cy="-12" r="5" fill="#C0956A" />
        <circle cx="-4" cy="-4" r="2" fill="#2D2D3A" />
        <circle cx="4" cy="-4" r="2" fill="#2D2D3A" />
        <path d="M-3 3 Q0 6 3 3" stroke="#8B6914" strokeWidth="1" fill="none" />
        {/* Arm offering */}
        <line x1="14" y1="8" x2="30" y2="12" stroke="#D4A574" strokeWidth="4" strokeLinecap="round" />
        <circle cx="32" cy="13" r="5" fill="#D4A050" />
      </g>
      {/* Bunny — receiving */}
      <g transform="translate(210, 90)">
        <circle cx="0" cy="16" r="18" fill="#F5F5F5" />
        <circle cx="0" cy="0" r="12" fill="#F5F5F5" />
        <ellipse cx="-6" cy="-18" rx="4" ry="14" fill="#F5F5F5" />
        <ellipse cx="6" cy="-18" rx="4" ry="14" fill="#F5F5F5" />
        <circle cx="-4" cy="-2" r="2" fill="#FF6B6B" />
        <circle cx="4" cy="-2" r="2" fill="#FF6B6B" />
        <path d="M-3 3 Q0 6 3 3" stroke="#2D2D3A" strokeWidth="1" fill="none" />
        {/* Paws reaching */}
        <line x1="-12" y1="8" x2="-26" y2="12" stroke="#F5F5F5" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** Page 4: Bunny gave Teddy a big hug. Thank you! */
function FriendPage4() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <rect width="300" height="220" fill="#FFF0F5" />
      {/* Floating hearts */}
      {[[80, 30], [220, 25], [150, 15], [60, 55], [240, 50], [130, 40]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y + 8} C${x} ${y + 5} ${x + 3} ${y + 4} ${x + 4} ${y + 6} C${x + 5} ${y + 4} ${x + 8} ${y + 5} ${x + 8} ${y + 8} C${x + 8} ${y + 12} ${x + 4} ${y + 14} ${x + 4} ${y + 14} C${x + 4} ${y + 14} ${x} ${y + 12} ${x} ${y + 8}Z`} fill="#FF8FAB" opacity={0.2 + i * 0.05} />
      ))}
      {/* Ground */}
      <ellipse cx="150" cy="210" rx="140" ry="20" fill="#A8E6CF" opacity="0.3" />
      {/* Teddy and Bunny hugging — centered */}
      <g transform="translate(150, 110)">
        {/* Teddy body */}
        <circle cx="-14" cy="16" r="22" fill="#D4A574" />
        <circle cx="-14" cy="-4" r="16" fill="#D4A574" />
        <circle cx="-24" cy="-16" r="6" fill="#C0956A" />
        <circle cx="-4" cy="-16" r="6" fill="#C0956A" />
        <circle cx="-18" cy="-6" r="2" fill="#2D2D3A" />
        <circle cx="-10" cy="-6" r="2" fill="#2D2D3A" />
        <path d="M-16 1 Q-14 4 -12 1" stroke="#8B6914" strokeWidth="1" fill="none" />
        {/* Bunny body */}
        <circle cx="14" cy="16" r="20" fill="#F5F5F5" />
        <circle cx="14" cy="-2" r="14" fill="#F5F5F5" />
        <ellipse cx="8" cy="-22" rx="5" ry="16" fill="#F5F5F5" />
        <ellipse cx="20" cy="-22" rx="5" ry="16" fill="#F5F5F5" />
        <ellipse cx="8" cy="-22" rx="3" ry="12" fill="#FFB6C1" opacity="0.3" />
        <ellipse cx="20" cy="-22" rx="3" ry="12" fill="#FFB6C1" opacity="0.3" />
        <circle cx="10" cy="-4" r="2" fill="#FF6B6B" />
        <circle cx="18" cy="-4" r="2" fill="#FF6B6B" />
        <path d="M12 1 Q14 4 16 1" stroke="#2D2D3A" strokeWidth="1" fill="none" />
        {/* Hug arms — overlap */}
        <path d="M-30 10 Q-10 25 10 10" stroke="#D4A574" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M30 10 Q10 25 -10 10" stroke="#F5F5F5" strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
      {/* Sparkle love effect */}
      <circle cx="150" cy="75" r="3" fill="#FFE66D" opacity="0.5" />
      <circle cx="138" cy="82" r="2" fill="#FFE66D" opacity="0.4" />
      <circle cx="162" cy="80" r="2" fill="#FFE66D" opacity="0.4" />
    </svg>
  );
}

/** Page 5: Best friends share and care. The end! */
function FriendPage5() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <rect width="300" height="220" fill="#FFF0F5" />
      {/* Big heart background */}
      <path d="M150 190 C150 190 50 140 50 85 C50 55 80 35 110 35 C130 35 145 50 150 60 C155 50 170 35 190 35 C220 35 250 55 250 85 C250 140 150 190 150 190Z" fill="#FF8FAB" opacity="0.12" />
      {/* Teddy and Bunny sitting side by side */}
      <g transform="translate(120, 105)">
        <circle cx="0" cy="14" rx="18" ry="14" fill="#D4A574" />
        <circle cx="0" cy="-2" r="14" fill="#D4A574" />
        <circle cx="-10" cy="-12" r="5" fill="#C0956A" />
        <circle cx="10" cy="-12" r="5" fill="#C0956A" />
        {/* Happy closed eyes */}
        <path d="M-6 -4 Q-4 -7 -2 -4" stroke="#2D2D3A" strokeWidth="1.2" fill="none" />
        <path d="M2 -4 Q4 -7 6 -4" stroke="#2D2D3A" strokeWidth="1.2" fill="none" />
        <path d="M-3 2 Q0 5 3 2" stroke="#8B6914" strokeWidth="1" fill="none" />
      </g>
      <g transform="translate(180, 100)">
        <circle cx="0" cy="14" rx="16" ry="12" fill="#F5F5F5" />
        <circle cx="0" cy="0" r="12" fill="#F5F5F5" />
        <ellipse cx="-6" cy="-18" rx="4" ry="14" fill="#F5F5F5" />
        <ellipse cx="6" cy="-18" rx="4" ry="14" fill="#F5F5F5" />
        {/* Happy closed eyes */}
        <path d="M-4 -2 Q-2 -5 0 -2" stroke="#2D2D3A" strokeWidth="1.2" fill="none" />
        <path d="M2 -2 Q4 -5 6 -2" stroke="#2D2D3A" strokeWidth="1.2" fill="none" />
        <path d="M-2 3 Q0 6 2 3" stroke="#2D2D3A" strokeWidth="1" fill="none" />
      </g>
      {/* Arm around each other */}
      <path d="M134 112 Q150 108 166 110" stroke="#D4A574" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* Heart above */}
      <path d="M150 60 C150 54 157 52 158 56 C159 52 166 54 166 60 C166 68 158 72 158 72 C158 72 150 68 150 60Z" fill="#FF6B6B" />
      {/* Sparkles */}
      <circle cx="140" cy="55" r="2" fill="#FFE66D" opacity="0.6" />
      <circle cx="175" cy="52" r="1.5" fill="#FFE66D" opacity="0.5" />
      <circle cx="130" cy="65" r="1.5" fill="#FFE66D" opacity="0.4" />
      <circle cx="185" cy="62" r="1.5" fill="#FFE66D" opacity="0.4" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════
// THE MAGIC GARDEN — 7 pages (s-4-adv-1)
// ═══════════════════════════════════════════════════════════

function GardenPage1() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <rect width="300" height="220" fill="#E8F5E9" />
      <ellipse cx="150" cy="210" rx="160" ry="30" fill="#6BCB77" opacity="0.5" />
      {/* Big old oak tree */}
      <rect x="110" y="50" width="20" height="120" rx="5" fill="#5D4037" />
      <ellipse cx="120" cy="40" rx="55" ry="45" fill="#2E7D32" />
      <ellipse cx="105" cy="48" rx="35" ry="32" fill="#388E3C" opacity="0.7" />
      <ellipse cx="135" cy="44" rx="35" ry="32" fill="#43A047" opacity="0.7" />
      {/* Roots visible */}
      <path d="M110 170 Q95 175 85 170" stroke="#5D4037" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M130 170 Q145 175 155 170" stroke="#5D4037" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* Tiny door at base of tree */}
      <rect x="112" y="130" width="16" height="26" rx="8" fill="#8B5CF6" />
      <rect x="114" y="132" width="12" height="22" rx="6" fill="#A78BFA" opacity="0.5" />
      <circle cx="124" cy="143" r="1.5" fill="#FFE66D" />
      {/* Door glow */}
      <ellipse cx="120" cy="143" rx="14" ry="18" fill="#FFE66D" opacity="0.06" />
      {/* Lily — girl looking at door */}
      <g transform="translate(170, 130)">
        <circle cx="0" cy="0" r="9" fill="#FFE0B2" />
        <path d="M-8 -3 Q0 -12 8 -3" fill="#5D4037" />
        <circle cx="-3" cy="-1" r="1.5" fill="#2D2D3A" />
        <circle cx="3" cy="-1" r="1.5" fill="#2D2D3A" />
        <path d="M-2 3 Q0 5 2 3" stroke="#2D2D3A" strokeWidth="0.8" fill="none" />
        <rect x="-7" y="10" width="14" height="18" rx="4" fill="#FF8FAB" />
        <line x1="0" y1="28" x2="-3" y2="40" stroke="#FFE0B2" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="0" y1="28" x2="3" y2="40" stroke="#FFE0B2" strokeWidth="2.5" strokeLinecap="round" />
        {/* Pointing arm */}
        <line x1="-7" y1="16" x2="-18" y2="14" stroke="#FFE0B2" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      {/* Sunlight through leaves */}
      <circle cx="70" cy="80" r="3" fill="#FFE66D" opacity="0.2" />
      <circle cx="160" cy="70" r="2" fill="#FFE66D" opacity="0.15" />
    </svg>
  );
}

function GardenPage2() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <defs>
        <linearGradient id="spa-garden" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8F5E9" />
          <stop offset="100%" stopColor="#C8E6C9" />
        </linearGradient>
      </defs>
      <rect width="300" height="220" fill="url(#spa-garden)" />
      {/* Magical garden — flowers everywhere */}
      <ellipse cx="150" cy="210" rx="160" ry="30" fill="#66BB6A" opacity="0.5" />
      {/* Sparkles everywhere */}
      {[[30, 30], [80, 50], [220, 25], [270, 55], [150, 20], [40, 80]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2} fill="#FFE66D" opacity={0.4 + i * 0.05} />
      ))}
      {/* Large colorful flowers */}
      {[[50, 150, '#FF6B6B'], [120, 160, '#A78BFA'], [200, 145, '#FFE66D'], [270, 155, '#FF8FAB'], [80, 170, '#4ECDC4']].map(([x, y, c], i) => (
        <g key={i} transform={`translate(${x}, ${y})`} aria-hidden="true">
          <rect x="-1" y="0" width="3" height={15 + i * 2} fill="#4CAF50" />
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx={Math.cos((a * Math.PI) / 180) * 8} cy={-6 + Math.sin((a * Math.PI) / 180) * 8} rx="5" ry="3.5" fill={c as string} opacity="0.8" transform={`rotate(${a}, ${Math.cos((a * Math.PI) / 180) * 8}, ${-6 + Math.sin((a * Math.PI) / 180) * 8})`} />
          ))}
          <circle cx="0" cy="-6" r="3.5" fill="#FFE66D" opacity="0.7" />
        </g>
      ))}
      {/* Magic door open — light spilling out */}
      <rect x="140" y="100" width="20" height="32" rx="10" fill="#8B5CF6" />
      <rect x="142" y="102" width="16" height="28" rx="8" fill="#FFE66D" opacity="0.3" />
      {/* Lily stepping through */}
      <g transform="translate(160, 110)">
        <circle cx="0" cy="0" r="7" fill="#FFE0B2" />
        <path d="M-6 -2 Q0 -9 6 -2" fill="#5D4037" />
        <circle cx="-2" cy="-1" r="1.2" fill="#2D2D3A" />
        <circle cx="2" cy="-1" r="1.2" fill="#2D2D3A" />
        <path d="M-2 2 Q0 4 2 2" stroke="#2D2D3A" strokeWidth="0.8" fill="none" />
        <rect x="-5" y="8" width="10" height="14" rx="3" fill="#FF8FAB" />
      </g>
    </svg>
  );
}

function GardenPage3() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <rect width="300" height="220" fill="#E8F5E9" />
      <ellipse cx="150" cy="210" rx="160" ry="30" fill="#66BB6A" opacity="0.5" />
      {/* Dancing flowers — animated feel with tilted stems */}
      {[[40, 130, '#FF6B6B', -10], [90, 140, '#FF8FAB', 8], [140, 125, '#A78BFA', -5], [190, 135, '#FFE66D', 12], [240, 128, '#4ECDC4', -8], [270, 140, '#FF8C42', 6]].map(([x, y, c, tilt], i) => (
        <g key={i} transform={`translate(${x}, ${y}) rotate(${tilt})`} aria-hidden="true">
          <path d={`M0 0 Q${(tilt as number) * 0.3} -15 0 -30`} stroke="#4CAF50" strokeWidth="2.5" fill="none" />
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx={Math.cos((a * Math.PI) / 180) * 10} cy={-32 + Math.sin((a * Math.PI) / 180) * 10} rx="6" ry="4" fill={c as string} opacity="0.8" transform={`rotate(${a}, ${Math.cos((a * Math.PI) / 180) * 10}, ${-32 + Math.sin((a * Math.PI) / 180) * 10})`} />
          ))}
          <circle cx="0" cy="-32" r="4" fill="white" opacity="0.4" />
        </g>
      ))}
      {/* Breeze lines */}
      <path d="M20 90 Q60 85 100 90 Q140 95 180 90" stroke="#A8E6CF" strokeWidth="1" opacity="0.3" fill="none" />
      <path d="M120 70 Q160 65 200 70 Q240 75 280 70" stroke="#A8E6CF" strokeWidth="1" opacity="0.25" fill="none" />
      {/* Tiny sparkles near flowers */}
      {[[60, 100], [170, 95], [250, 100], [110, 110]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.5} fill="#FFE66D" opacity={0.4 + i * 0.08} />
      ))}
    </svg>
  );
}

function GardenPage4() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <rect width="300" height="220" fill="#E8F5E9" />
      <ellipse cx="150" cy="210" rx="160" ry="28" fill="#66BB6A" opacity="0.5" />
      {/* Big butterfly center */}
      <g transform="translate(150, 85)">
        <ellipse cx="0" cy="0" rx="3" ry="12" fill="#2D2D3A" />
        {/* Left wings */}
        <ellipse cx="-22" cy="-8" rx="22" ry="16" fill="#A78BFA" opacity="0.8" />
        <ellipse cx="-16" cy="8" rx="16" ry="12" fill="#8B5CF6" opacity="0.6" />
        {/* Right wings */}
        <ellipse cx="22" cy="-8" rx="22" ry="16" fill="#FF8FAB" opacity="0.8" />
        <ellipse cx="16" cy="8" rx="16" ry="12" fill="#FF6B6B" opacity="0.6" />
        {/* Wing patterns — rainbow dots */}
        <circle cx="-20" cy="-8" r="4" fill="#FFE66D" opacity="0.5" />
        <circle cx="20" cy="-8" r="4" fill="#4ECDC4" opacity="0.5" />
        <circle cx="-14" cy="6" r="3" fill="#FF8C42" opacity="0.4" />
        <circle cx="14" cy="6" r="3" fill="#6BCB77" opacity="0.4" />
        {/* Antennae */}
        <line x1="-2" y1="-12" x2="-8" y2="-22" stroke="#2D2D3A" strokeWidth="1" />
        <line x1="2" y1="-12" x2="8" y2="-22" stroke="#2D2D3A" strokeWidth="1" />
        <circle cx="-8" cy="-22" r="2" fill="#A78BFA" />
        <circle cx="8" cy="-22" r="2" fill="#FF8FAB" />
      </g>
      {/* Speech bubble */}
      <g transform="translate(195, 55)" aria-hidden="true">
        <rect x="0" y="0" width="70" height="22" rx="11" fill="white" opacity="0.9" />
        <text x="35" y="15" textAnchor="middle" fill="#A78BFA" fontSize="10" fontWeight="bold" fontFamily="sans-serif">Welcome!</text>
        <polygon points="8,22 16,22 4,30" fill="white" opacity="0.9" />
      </g>
      {/* Flowers on ground */}
      {[[40, 170], [120, 175], [200, 168], [270, 172]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x}, ${y})`} aria-hidden="true">
          <rect x="-0.5" y="0" width="2" height="10" fill="#4CAF50" />
          <circle cx="0" cy="-3" r="4" fill={['#FF8FAB', '#FFE66D', '#A78BFA', '#4ECDC4'][i]} />
        </g>
      ))}
      {/* Sparkles */}
      {[[60, 40], [240, 30], [100, 60], [200, 130]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2} fill="#FFE66D" opacity={0.3 + i * 0.08} />
      ))}
    </svg>
  );
}

function GardenPage5() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <rect width="300" height="220" fill="#E8F5E9" />
      <ellipse cx="150" cy="210" rx="160" ry="28" fill="#66BB6A" opacity="0.5" />
      {/* Golden sunflower — large, glowing */}
      <g transform="translate(150, 100)">
        <rect x="-2" y="20" width="5" height="50" fill="#4CAF50" />
        <circle cx="0" cy="0" r="20" fill="#FFD93D" />
        <circle cx="0" cy="0" r="12" fill="#8B6914" opacity="0.6" />
        {/* Petals */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a) => (
          <ellipse key={a} cx={Math.cos((a * Math.PI) / 180) * 18} cy={Math.sin((a * Math.PI) / 180) * 18} rx="8" ry="4" fill="#FFE66D" transform={`rotate(${a}, ${Math.cos((a * Math.PI) / 180) * 18}, ${Math.sin((a * Math.PI) / 180) * 18})`} />
        ))}
        {/* Glow effect */}
        <circle cx="0" cy="0" r="30" fill="#FFE66D" opacity="0.08" />
        <circle cx="0" cy="0" r="40" fill="#FFE66D" opacity="0.04" />
      </g>
      {/* Lily reaching for sunflower */}
      <g transform="translate(90, 120)">
        <circle cx="0" cy="0" r="7" fill="#FFE0B2" />
        <path d="M-6 -2 Q0 -9 6 -2" fill="#5D4037" />
        <circle cx="-2" cy="-1" r="1.2" fill="#2D2D3A" />
        <circle cx="2" cy="-1" r="1.2" fill="#2D2D3A" />
        <path d="M-1 2 Q0 4 1 2" stroke="#2D2D3A" strokeWidth="0.8" fill="none" />
        <rect x="-5" y="8" width="10" height="14" rx="3" fill="#FF8FAB" />
        <line x1="5" y1="12" x2="20" y2="6" stroke="#FFE0B2" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      {/* Small flowers */}
      {[[40, 165], [250, 160], [220, 172]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x}, ${y})`} aria-hidden="true">
          <rect x="-0.5" y="0" width="2" height="8" fill="#4CAF50" />
          <circle cx="0" cy="-3" r="3" fill={['#FF8FAB', '#A78BFA', '#4ECDC4'][i]} />
        </g>
      ))}
    </svg>
  );
}

function GardenPage6() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <rect width="300" height="220" fill="#E8F5E9" />
      <ellipse cx="150" cy="210" rx="160" ry="28" fill="#66BB6A" opacity="0.5" />
      {/* Garden filled with sparkle magic */}
      {[[30, 40, 5], [80, 25, 4], [130, 35, 6], [180, 20, 4], [240, 45, 5], [270, 30, 3],
        [50, 80, 3], [110, 70, 4], [200, 75, 5], [260, 85, 3],
        [70, 120, 3], [160, 110, 4], [230, 115, 3]].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x}, ${y})`} aria-hidden="true">
          <line x1="0" y1={-(s as number)} x2="0" y2={s as number} stroke="#FFE66D" strokeWidth="1" strokeLinecap="round" opacity={0.4 + (i % 4) * 0.1} />
          <line x1={-(s as number)} y1="0" x2={s as number} y2="0" stroke="#FFE66D" strokeWidth="1" strokeLinecap="round" opacity={0.4 + (i % 4) * 0.1} />
        </g>
      ))}
      {/* Colorful flowers glowing */}
      {[[50, 150, '#FF6B6B'], [110, 160, '#A78BFA'], [170, 148, '#FFE66D'], [230, 155, '#4ECDC4'], [280, 162, '#FF8FAB']].map(([x, y, c], i) => (
        <g key={i} transform={`translate(${x}, ${y})`} aria-hidden="true">
          <rect x="-1" y="0" width="2.5" height="12" fill="#4CAF50" />
          <circle cx="0" cy="-5" r="6" fill={c as string} opacity="0.7" />
          <circle cx="0" cy="-5" r="3" fill="white" opacity="0.3" />
          <circle cx="0" cy="-5" r="10" fill={c as string} opacity="0.06" />
        </g>
      ))}
      {/* Lily walking through */}
      <g transform="translate(150, 115)">
        <circle cx="0" cy="0" r="7" fill="#FFE0B2" />
        <path d="M-6 -2 Q0 -9 6 -2" fill="#5D4037" />
        <circle cx="-2" cy="-1" r="1.2" fill="#2D2D3A" />
        <circle cx="2" cy="-1" r="1.2" fill="#2D2D3A" />
        <path d="M-2 2 Q0 5 2 2" stroke="#2D2D3A" strokeWidth="1" fill="none" />
        <rect x="-5" y="8" width="10" height="14" rx="3" fill="#FF8FAB" />
      </g>
    </svg>
  );
}

function GardenPage7() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <rect width="300" height="220" fill="#E8F5E9" />
      <ellipse cx="150" cy="210" rx="160" ry="28" fill="#66BB6A" opacity="0.5" />
      {/* Magic door visible in distance */}
      <rect x="135" y="120" width="14" height="22" rx="7" fill="#8B5CF6" opacity="0.4" />
      {/* Lily waving goodbye — happy */}
      <g transform="translate(100, 110)">
        <circle cx="0" cy="0" r="9" fill="#FFE0B2" />
        <path d="M-8 -3 Q0 -12 8 -3" fill="#5D4037" />
        <path d="M-3 -1 Q-1 -4 1 -1" stroke="#2D2D3A" strokeWidth="1.2" fill="none" />
        <path d="M2 -1 Q4 -4 6 -1" stroke="#2D2D3A" strokeWidth="1.2" fill="none" />
        <path d="M-2 4 Q0 7 2 4" stroke="#2D2D3A" strokeWidth="1.2" fill="none" />
        <rect x="-7" y="10" width="14" height="18" rx="4" fill="#FF8FAB" />
        {/* Waving arm */}
        <line x1="7" y1="14" x2="18" y2="4" stroke="#FFE0B2" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="19" cy="3" r="3" fill="#FFE0B2" />
      </g>
      {/* Flowers */}
      {[[40, 160], [200, 155], [260, 165]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x}, ${y})`} aria-hidden="true">
          <rect x="-0.5" y="0" width="2" height="10" fill="#4CAF50" />
          <circle cx="0" cy="-3" r="4" fill={['#FF8FAB', '#FFE66D', '#A78BFA'][i]} />
        </g>
      ))}
      {/* Sparkle trail from Lily */}
      {[[125, 105], [135, 95], [148, 100], [160, 90]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2 - i * 0.3} fill="#FFE66D" opacity={0.5 - i * 0.1} />
      ))}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════
// RAINBOW AFTER RAIN — 7 pages (s-4-nat-1)
// ═══════════════════════════════════════════════════════════

function RainPage1() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <rect width="300" height="220" fill="#B0BEC5" opacity="0.3" />
      <rect width="300" height="220" fill="#CFD8DC" opacity="0.2" />
      {/* Grey rainy sky */}
      <ellipse cx="80" cy="35" rx="40" ry="18" fill="#90A4AE" opacity="0.6" />
      <ellipse cx="60" cy="40" rx="28" ry="14" fill="#78909C" opacity="0.5" />
      <ellipse cx="180" cy="30" rx="45" ry="20" fill="#90A4AE" opacity="0.5" />
      <ellipse cx="200" cy="38" rx="30" ry="14" fill="#78909C" opacity="0.4" />
      {/* Rain drops */}
      {[[40, 60], [70, 55], [100, 65], [130, 58], [160, 62], [190, 56], [220, 64], [250, 58], [60, 85], [120, 80], [180, 88], [240, 82]].map(([x, y], i) => (
        <line key={i} x1={x} y1={y} x2={(x as number) - 2} y2={(y as number) + 12} stroke="#45B7D1" strokeWidth="1.5" strokeLinecap="round" opacity={0.3 + (i % 3) * 0.1} />
      ))}
      {/* Green meadow */}
      <ellipse cx="150" cy="200" rx="160" ry="35" fill="#66BB6A" opacity="0.4" />
      {/* Flowers getting rained on */}
      {[[50, 170], [120, 175], [200, 168], [270, 173]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x}, ${y})`} aria-hidden="true">
          <rect x="-0.5" y="0" width="2" height="10" fill="#4CAF50" />
          <circle cx="0" cy="-3" r="3.5" fill={['#FF8FAB', '#FFE66D', '#A78BFA', '#FF6B6B'][i]} opacity="0.7" />
        </g>
      ))}
    </svg>
  );
}

function RainPage2() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <rect width="300" height="220" fill="#CFD8DC" opacity="0.2" />
      <ellipse cx="150" cy="200" rx="160" ry="35" fill="#66BB6A" opacity="0.5" />
      {/* Light rain still falling */}
      {[[60, 30], [130, 25], [200, 35], [260, 28]].map(([x, y], i) => (
        <line key={i} x1={x} y1={y} x2={(x as number) - 1} y2={(y as number) + 10} stroke="#45B7D1" strokeWidth="1" strokeLinecap="round" opacity={0.2 + i * 0.05} />
      ))}
      {/* Tall flowers drinking water — taller now */}
      {[[50, 130, '#FF6B6B', 35], [110, 125, '#A78BFA', 40], [170, 128, '#FFE66D', 38], [230, 132, '#FF8FAB', 34], [280, 135, '#4ECDC4', 32]].map(([x, y, c, h], i) => (
        <g key={i} transform={`translate(${x}, ${y})`} aria-hidden="true">
          <rect x="-1" y="0" width="3" height={h as number} fill="#4CAF50" />
          <ellipse cx="-6" cy={(h as number) * 0.6} rx="5" ry="3" fill="#66BB6A" transform={`rotate(-20, -6, ${(h as number) * 0.6})`} />
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx={Math.cos((a * Math.PI) / 180) * 8} cy={-6 + Math.sin((a * Math.PI) / 180) * 8} rx="5" ry="3.5" fill={c as string} opacity="0.8" transform={`rotate(${a}, ${Math.cos((a * Math.PI) / 180) * 8}, ${-6 + Math.sin((a * Math.PI) / 180) * 8})`} />
          ))}
          <circle cx="0" cy="-6" r="3" fill="white" opacity="0.3" />
        </g>
      ))}
      {/* Water droplets on petals */}
      <circle cx="52" cy="124" r="1.5" fill="#87CEEB" opacity="0.5" />
      <circle cx="172" cy="122" r="1.5" fill="#87CEEB" opacity="0.4" />
    </svg>
  );
}

function RainPage3() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <DaySky />
      <rect width="300" height="220" fill="url(#spa-day)" />
      {/* Departing clouds */}
      <ellipse cx="40" cy="40" rx="30" ry="14" fill="#B0BEC5" opacity="0.4" />
      <ellipse cx="25" cy="44" rx="20" ry="10" fill="#90A4AE" opacity="0.3" />
      {/* Sun peeking from behind cloud */}
      <circle cx="200" cy="45" r="24" fill="#FFE66D" />
      <circle cx="200" cy="45" r="32" fill="#FFE66D" opacity="0.1" />
      <ellipse cx="185" cy="42" rx="30" ry="16" fill="#B0BEC5" opacity="0.5" />
      {/* Sun rays */}
      {[0, 45, 315].map((a) => (
        <line key={a} x1={200 + Math.cos((a * Math.PI) / 180) * 28} y1={45 + Math.sin((a * Math.PI) / 180) * 28} x2={200 + Math.cos((a * Math.PI) / 180) * 38} y2={45 + Math.sin((a * Math.PI) / 180) * 38} stroke="#FFE66D" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
      ))}
      {/* Meadow */}
      <ellipse cx="150" cy="200" rx="160" ry="35" fill="#66BB6A" opacity="0.5" />
      {/* Wet sparkles on ground */}
      {[[60, 170], [140, 175], [220, 168]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={1.5} fill="#87CEEB" opacity={0.3 + i * 0.05} />
      ))}
    </svg>
  );
}

function RainPage4() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <DaySky />
      <rect width="300" height="220" fill="url(#spa-day)" />
      {/* Full rainbow — big and bold */}
      {[
        { r: 90, c: '#FF6B6B' }, { r: 84, c: '#FF8C42' }, { r: 78, c: '#FFE66D' },
        { r: 72, c: '#6BCB77' }, { r: 66, c: '#45B7D1' }, { r: 60, c: '#A78BFA' },
      ].map(({ r, c }) => (
        <path key={c} d={`M${150 - r} 160 A${r} ${r} 0 0 1 ${150 + r} 160`} stroke={c} strokeWidth="7" fill="none" opacity="0.7" />
      ))}
      {/* Sun fully out */}
      <circle cx="250" cy="35" r="20" fill="#FFE66D" />
      {/* Small white cloud */}
      <ellipse cx="60" cy="35" rx="22" ry="10" fill="white" opacity="0.7" />
      {/* Meadow */}
      <ellipse cx="150" cy="200" rx="160" ry="30" fill="#66BB6A" opacity="0.5" />
      {/* Flowers celebrating */}
      {[[40, 170], [100, 175], [200, 168], [260, 172]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x}, ${y})`} aria-hidden="true">
          <rect x="-0.5" y="0" width="2" height="8" fill="#4CAF50" />
          <circle cx="0" cy="-3" r="3.5" fill={['#FF6B6B', '#FFE66D', '#A78BFA', '#FF8FAB'][i]} />
        </g>
      ))}
    </svg>
  );
}

function RainPage5() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <DaySky />
      <rect width="300" height="220" fill="url(#spa-day)" />
      {/* Color palette scene — six color blobs */}
      {[
        { x: 40, y: 80, c: '#FF6B6B', label: '' },
        { x: 90, y: 70, c: '#FF8C42', label: '' },
        { x: 140, y: 65, c: '#FFE66D', label: '' },
        { x: 190, y: 70, c: '#6BCB77', label: '' },
        { x: 240, y: 80, c: '#45B7D1', label: '' },
        { x: 265, y: 95, c: '#A78BFA', label: '' },
      ].map(({ x, y, c }, i) => (
        <g key={i} aria-hidden="true">
          <circle cx={x} cy={y} r={18} fill={c} opacity="0.6" />
          <circle cx={x} cy={y} r={12} fill={c} opacity="0.3" />
        </g>
      ))}
      {/* Rainbow arc connecting them */}
      <path d="M40 100 Q90 50 150 45 Q210 50 265 100" stroke="white" strokeWidth="1.5" fill="none" opacity="0.3" />
      {/* Meadow */}
      <ellipse cx="150" cy="200" rx="160" ry="30" fill="#66BB6A" opacity="0.5" />
    </svg>
  );
}

function RainPage6() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <DaySky />
      <rect width="300" height="220" fill="url(#spa-day)" />
      {/* Rainbow in background */}
      {[80, 74, 68, 62, 56, 50].map((r, i) => (
        <path key={i} d={`M${150 - r} 140 A${r} ${r} 0 0 1 ${150 + r} 140`} stroke={['#FF6B6B', '#FF8C42', '#FFE66D', '#6BCB77', '#45B7D1', '#A78BFA'][i]} strokeWidth="4" fill="none" opacity="0.3" />
      ))}
      {/* Meadow */}
      <ellipse cx="150" cy="200" rx="160" ry="30" fill="#66BB6A" opacity="0.5" />
      {/* Fox watching */}
      <g transform="translate(80, 145)">
        <ellipse cx="0" cy="8" rx="12" ry="9" fill="#FF8C42" />
        <circle cx="0" cy="-4" r="9" fill="#FF8C42" />
        <polygon points="-7,-12 -4,-4 -10,-5" fill="#FF8C42" />
        <polygon points="7,-12 4,-4 10,-5" fill="#FF8C42" />
        <circle cx="-3" cy="-6" r="1.5" fill="#2D2D3A" />
        <circle cx="3" cy="-6" r="1.5" fill="#2D2D3A" />
        <ellipse cx="0" cy="-2" rx="1.2" ry="0.8" fill="#2D2D3A" />
        <ellipse cx="0" cy="0" rx="4" ry="3" fill="white" />
        <path d="M12 14 Q20 10 18 4" stroke="#FF8C42" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      {/* Rabbit watching */}
      <g transform="translate(200, 148)">
        <ellipse cx="0" cy="6" rx="8" ry="7" fill="#F5F5F5" />
        <circle cx="0" cy="-4" r="7" fill="#F5F5F5" />
        <ellipse cx="-3" cy="-16" rx="3" ry="10" fill="#F5F5F5" />
        <ellipse cx="3" cy="-16" rx="3" ry="10" fill="#F5F5F5" />
        <circle cx="-2" cy="-5" r="1.2" fill="#FF6B6B" />
        <circle cx="2" cy="-5" r="1.2" fill="#FF6B6B" />
      </g>
      {/* Deer watching */}
      <g transform="translate(250, 140)">
        <ellipse cx="0" cy="10" rx="10" ry="12" fill="#D4A574" />
        <circle cx="4" cy="-4" r="8" fill="#D4A574" />
        <circle cx="1" cy="-6" r="1.2" fill="#2D2D3A" />
        <circle cx="6" cy="-6" r="1.2" fill="#2D2D3A" />
        {/* Antlers */}
        <line x1="0" y1="-12" x2="-4" y2="-22" stroke="#8B6914" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="-4" y1="-22" x2="-8" y2="-20" stroke="#8B6914" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="6" y1="-12" x2="10" y2="-22" stroke="#8B6914" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="10" y1="-22" x2="14" y2="-20" stroke="#8B6914" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function RainPage7() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <DaySky />
      <rect width="300" height="220" fill="url(#spa-day)" />
      {/* Faded rainbow */}
      {[75, 70, 65, 60, 55, 50].map((r, i) => (
        <path key={i} d={`M${150 - r} 130 A${r} ${r} 0 0 1 ${150 + r} 130`} stroke={['#FF6B6B', '#FF8C42', '#FFE66D', '#6BCB77', '#45B7D1', '#A78BFA'][i]} strokeWidth="5" fill="none" opacity="0.5" />
      ))}
      {/* Lush meadow */}
      <ellipse cx="150" cy="200" rx="160" ry="35" fill="#66BB6A" opacity="0.5" />
      {/* Many flowers — nature's art */}
      {[[30, 160, '#FF6B6B'], [60, 168, '#FFE66D'], [100, 162, '#A78BFA'], [140, 170, '#FF8FAB'], [180, 158, '#4ECDC4'], [220, 165, '#FF8C42'], [260, 162, '#6BCB77']].map(([x, y, c], i) => (
        <g key={i} transform={`translate(${x}, ${y})`} aria-hidden="true">
          <rect x="-0.5" y="0" width="2" height={8 + i} fill="#4CAF50" />
          <circle cx="0" cy="-3" r={3 + (i % 2)} fill={c as string} opacity="0.8" />
        </g>
      ))}
      {/* Butterfly */}
      <g transform="translate(100, 100)" aria-hidden="true">
        <ellipse cx="0" cy="0" rx="1" ry="3" fill="#2D2D3A" />
        <ellipse cx="-4" cy="-1" rx="4" ry="3" fill="#A78BFA" opacity="0.6" />
        <ellipse cx="4" cy="-1" rx="4" ry="3" fill="#FF8FAB" opacity="0.6" />
      </g>
      {/* Sun warm */}
      <circle cx="250" cy="35" r="18" fill="#FFE66D" opacity="0.7" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════
// THE BRAVE LITTLE CAT — 7 pages (s-4-ani-1)
// ═══════════════════════════════════════════════════════════

function CatPage1() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <DaySky />
      <rect width="300" height="220" fill="url(#spa-day)" />
      <ellipse cx="150" cy="205" rx="160" ry="30" fill="#66BB6A" opacity="0.5" />
      {/* Small but brave cat — Whiskers */}
      <g transform="translate(150, 140)">
        <ellipse cx="0" cy="10" rx="14" ry="12" fill="#9E9E9E" />
        <circle cx="0" cy="-4" r="11" fill="#9E9E9E" />
        <polygon points="-8,-14 -5,-5 -12,-6" fill="#9E9E9E" />
        <polygon points="8,-14 5,-5 12,-6" fill="#9E9E9E" />
        <polygon points="-8,-14 -5,-5 -12,-6" fill="#FFB6C1" opacity="0.3" />
        <polygon points="8,-14 5,-5 12,-6" fill="#FFB6C1" opacity="0.3" />
        <circle cx="-3" cy="-6" r="2" fill="#2D2D3A" />
        <circle cx="3" cy="-6" r="2" fill="#2D2D3A" />
        <circle cx="-2.5" cy="-6.5" r="0.6" fill="white" />
        <circle cx="3.5" cy="-6.5" r="0.6" fill="white" />
        <ellipse cx="0" cy="-2" rx="1.5" ry="1" fill="#FFB6C1" />
        <path d="M-2 0 Q0 2 2 0" stroke="#2D2D3A" strokeWidth="0.8" fill="none" />
        {/* Whiskers */}
        <line x1="-10" y1="-4" x2="-18" y2="-6" stroke="#BDBDBD" strokeWidth="0.8" />
        <line x1="-10" y1="-2" x2="-18" y2="-1" stroke="#BDBDBD" strokeWidth="0.8" />
        <line x1="10" y1="-4" x2="18" y2="-6" stroke="#BDBDBD" strokeWidth="0.8" />
        <line x1="10" y1="-2" x2="18" y2="-1" stroke="#BDBDBD" strokeWidth="0.8" />
        {/* Tail up — confident */}
        <path d="M12 14 Q22 8 20 -2" stroke="#9E9E9E" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        {/* Paws */}
        <ellipse cx="-6" cy="22" rx="4" ry="2.5" fill="#BDBDBD" />
        <ellipse cx="6" cy="22" rx="4" ry="2.5" fill="#BDBDBD" />
      </g>
      {/* Flowers around */}
      {[[60, 170], [240, 175]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x}, ${y})`} aria-hidden="true">
          <rect x="-0.5" y="0" width="1.5" height="8" fill="#4CAF50" />
          <circle cx="0" cy="-2" r="3" fill={['#FF8FAB', '#FFE66D'][i]} />
        </g>
      ))}
      <circle cx="260" cy="30" r="18" fill="#FFE66D" />
    </svg>
  );
}

function CatPage2() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <DaySky />
      <rect width="300" height="220" fill="url(#spa-day)" />
      <ellipse cx="150" cy="205" rx="160" ry="30" fill="#66BB6A" opacity="0.5" />
      {/* Cat with ears perked — hearing cry */}
      <g transform="translate(120, 140)">
        <ellipse cx="0" cy="10" rx="14" ry="12" fill="#9E9E9E" />
        <circle cx="0" cy="-4" r="11" fill="#9E9E9E" />
        <polygon points="-8,-14 -5,-5 -12,-6" fill="#9E9E9E" />
        <polygon points="8,-14 5,-5 12,-6" fill="#9E9E9E" />
        <circle cx="-3" cy="-6" r="2.5" fill="#2D2D3A" />
        <circle cx="3" cy="-6" r="2.5" fill="#2D2D3A" />
        <ellipse cx="0" cy="-2" rx="1.5" ry="1" fill="#FFB6C1" />
      </g>
      {/* "Help!" speech bubble from above */}
      <g transform="translate(200, 40)" aria-hidden="true">
        <rect x="0" y="0" width="55" height="24" rx="12" fill="white" opacity="0.9" />
        <text x="28" y="16" textAnchor="middle" fill="#FF6B6B" fontSize="11" fontWeight="bold" fontFamily="sans-serif">Help!</text>
        <polygon points="15,24 22,24 10,34" fill="white" opacity="0.9" />
      </g>
      {/* Tree in distance where sound comes from */}
      <rect x="210" y="80" width="10" height="80" rx="3" fill="#5D4037" />
      <ellipse cx="215" cy="70" rx="30" ry="28" fill="#2E7D32" />
    </svg>
  );
}

function CatPage3() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <DaySky />
      <rect width="300" height="220" fill="url(#spa-day)" />
      <ellipse cx="150" cy="205" rx="160" ry="30" fill="#66BB6A" opacity="0.5" />
      {/* Big tree */}
      <rect x="130" y="60" width="14" height="110" rx="4" fill="#5D4037" />
      <ellipse cx="137" cy="50" rx="40" ry="35" fill="#2E7D32" />
      <ellipse cx="125" cy="56" rx="28" ry="25" fill="#388E3C" opacity="0.7" />
      {/* Nest on ground (fallen) */}
      <ellipse cx="180" cy="168" rx="14" ry="5" fill="#8B6914" opacity="0.7" />
      {/* Baby bird on ground — fallen */}
      <g transform="translate(180, 155)">
        <circle cx="0" cy="0" r="6" fill="#FFE066" />
        <circle cx="3" cy="-2" r="1.5" fill="#2D2D3A" />
        <circle cx="3.5" cy="-2.5" r="0.5" fill="white" />
        <polygon points="5,-1 9,0 5,1" fill="#FF8C42" />
        {/* Tiny wing */}
        <path d="M-4 2 Q-8 -2 -4 -2" fill="#E6C84A" />
        {/* Tear drop */}
        <circle cx="5" cy="2" r="1" fill="#87CEEB" opacity="0.6" />
      </g>
      {/* Cat looking up at tree, then down at bird */}
      <g transform="translate(100, 148)">
        <ellipse cx="0" cy="6" rx="10" ry="8" fill="#9E9E9E" />
        <circle cx="6" cy="-4" r="8" fill="#9E9E9E" />
        <polygon points="1,-11 3,-4 -2,-5" fill="#9E9E9E" />
        <polygon points="11,-11 9,-4 14,-5" fill="#9E9E9E" />
        <circle cx="4" cy="-6" r="1.5" fill="#2D2D3A" />
        <circle cx="8" cy="-6" r="1.5" fill="#2D2D3A" />
        <ellipse cx="6" cy="-3" rx="1" ry="0.7" fill="#FFB6C1" />
      </g>
    </svg>
  );
}

function CatPage4() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <DaySky />
      <rect width="300" height="220" fill="url(#spa-day)" />
      {/* Big tree — cat climbing */}
      <rect x="120" y="30" width="16" height="160" rx="4" fill="#5D4037" />
      <ellipse cx="128" cy="25" rx="45" ry="35" fill="#2E7D32" />
      {/* Cat mid-climb */}
      <g transform="translate(110, 95)">
        <ellipse cx="0" cy="0" rx="8" ry="12" fill="#9E9E9E" />
        <circle cx="-2" cy="-14" r="8" fill="#9E9E9E" />
        <polygon points="-7,-21 -5,-14 -10,-15" fill="#9E9E9E" />
        <polygon points="3,-21 1,-14 6,-15" fill="#9E9E9E" />
        <circle cx="-4" cy="-16" r="1.5" fill="#2D2D3A" />
        <circle cx="0" cy="-16" r="1.5" fill="#2D2D3A" />
        {/* Determined brows */}
        <line x1="-6" y1="-18" x2="-3" y2="-17.5" stroke="#2D2D3A" strokeWidth="0.8" />
        <line x1="2" y1="-18" x2="-1" y2="-17.5" stroke="#2D2D3A" strokeWidth="0.8" />
        {/* Paws gripping bark */}
        <circle cx="-7" cy="-6" r="3" fill="#BDBDBD" />
        <circle cx="7" cy="-6" r="3" fill="#BDBDBD" />
        {/* Tail */}
        <path d="M6 10 Q16 6 14 -2" stroke="#9E9E9E" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      {/* Nest visible up in branches */}
      <ellipse cx="160" cy="50" rx="12" ry="5" fill="#8B6914" opacity="0.7" />
      {/* Ground */}
      <ellipse cx="150" cy="205" rx="160" ry="30" fill="#66BB6A" opacity="0.5" />
    </svg>
  );
}

function CatPage5() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <DaySky />
      <rect width="300" height="220" fill="url(#spa-day)" />
      {/* Tree branch close-up */}
      <path d="M0 120 Q80 110 160 115 Q240 120 300 110" stroke="#5D4037" strokeWidth="12" fill="none" strokeLinecap="round" />
      {/* Leaves around */}
      <ellipse cx="60" cy="90" rx="25" ry="20" fill="#2E7D32" opacity="0.4" />
      <ellipse cx="200" cy="85" rx="30" ry="22" fill="#388E3C" opacity="0.3" />
      {/* Cat on branch with bird in paws */}
      <g transform="translate(140, 85)">
        <ellipse cx="0" cy="10" rx="14" ry="10" fill="#9E9E9E" />
        <circle cx="0" cy="-4" r="10" fill="#9E9E9E" />
        <polygon points="-7,-13 -4,-5 -10,-6" fill="#9E9E9E" />
        <polygon points="7,-13 4,-5 10,-6" fill="#9E9E9E" />
        <circle cx="-3" cy="-6" r="1.5" fill="#2D2D3A" />
        <circle cx="3" cy="-6" r="1.5" fill="#2D2D3A" />
        <path d="M-2 -1 Q0 1 2 -1" stroke="#2D2D3A" strokeWidth="0.8" fill="none" />
        {/* Paws cradling bird */}
        <ellipse cx="0" cy="18" rx="8" ry="5" fill="#BDBDBD" />
        {/* Baby bird in paws */}
        <circle cx="0" cy="16" r="5" fill="#FFE066" />
        <circle cx="2" cy="14" r="1" fill="#2D2D3A" />
        <polygon points="4,15 7,14.5 4,16" fill="#FF8C42" />
      </g>
    </svg>
  );
}

function CatPage6() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <DaySky />
      <rect width="300" height="220" fill="url(#spa-day)" />
      {/* Tree with nest */}
      <rect x="120" y="30" width="14" height="140" rx="4" fill="#5D4037" />
      <ellipse cx="127" cy="25" rx="40" ry="32" fill="#2E7D32" />
      {/* Branch with nest */}
      <path d="M134 65 Q160 60 185 68" stroke="#5D4037" strokeWidth="6" fill="none" strokeLinecap="round" />
      <ellipse cx="170" cy="62" rx="16" ry="6" fill="#8B6914" />
      <path d="M156 62 Q160 56 165 60 Q170 54 175 59 Q180 54 184 62" stroke="#6D4C13" strokeWidth="1.2" fill="none" />
      {/* Baby bird back in nest — happy */}
      <g transform="translate(170, 52)">
        <circle cx="0" cy="0" r="6" fill="#FFE066" />
        <circle cx="2" cy="-2" r="1.5" fill="#2D2D3A" />
        <polygon points="4,-1 8,0 4,1" fill="#FF8C42" />
        {/* Happy chirp lines */}
        <line x1="8" y1="-3" x2="12" y2="-5" stroke="#FFE66D" strokeWidth="1" opacity="0.5" />
        <line x1="9" y1="0" x2="13" y2="0" stroke="#FFE66D" strokeWidth="1" opacity="0.4" />
      </g>
      {/* Cat climbing down — satisfied */}
      <g transform="translate(108, 100)">
        <ellipse cx="0" cy="0" rx="8" ry="11" fill="#9E9E9E" />
        <circle cx="-2" cy="-12" r="8" fill="#9E9E9E" />
        <polygon points="-7,-19 -5,-12 -10,-13" fill="#9E9E9E" />
        <polygon points="3,-19 1,-12 6,-13" fill="#9E9E9E" />
        {/* Happy closed eyes */}
        <path d="M-5 -14 Q-3 -16 -1 -14" stroke="#2D2D3A" strokeWidth="1" fill="none" />
        <path d="M0 -14 Q2 -16 4 -14" stroke="#2D2D3A" strokeWidth="1" fill="none" />
        <path d="M-2 -10 Q0 -8 2 -10" stroke="#2D2D3A" strokeWidth="0.8" fill="none" />
      </g>
      <ellipse cx="150" cy="205" rx="160" ry="30" fill="#66BB6A" opacity="0.5" />
    </svg>
  );
}

function CatPage7() {
  return (
    <svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
      <DaySky />
      <rect width="300" height="220" fill="url(#spa-day)" />
      <ellipse cx="150" cy="205" rx="160" ry="30" fill="#66BB6A" opacity="0.5" />
      <circle cx="250" cy="35" r="18" fill="#FFE66D" />
      {/* Cat on ground — proud */}
      <g transform="translate(140, 135)">
        <ellipse cx="0" cy="12" rx="16" ry="14" fill="#9E9E9E" />
        <circle cx="0" cy="-4" r="12" fill="#9E9E9E" />
        <polygon points="-9,-15 -6,-5 -13,-7" fill="#9E9E9E" />
        <polygon points="9,-15 6,-5 13,-7" fill="#9E9E9E" />
        {/* Proud happy face */}
        <path d="M-4 -6 Q-2 -9 0 -6" stroke="#2D2D3A" strokeWidth="1.2" fill="none" />
        <path d="M1 -6 Q3 -9 5 -6" stroke="#2D2D3A" strokeWidth="1.2" fill="none" />
        <path d="M-3 0 Q0 4 3 0" stroke="#2D2D3A" strokeWidth="1.2" fill="none" />
        <circle cx="-4" cy="0" r="3" fill="#FFB6C1" opacity="0.2" />
        <circle cx="4" cy="0" r="3" fill="#FFB6C1" opacity="0.2" />
        {/* Tail swishing happily */}
        <path d="M14 16 Q24 10 22 0 Q20 -8 24 -12" stroke="#9E9E9E" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      </g>
      {/* Bird flying overhead — chirping thanks */}
      <g transform="translate(180, 80)">
        <circle cx="0" cy="0" r="5" fill="#FFE066" />
        <circle cx="3" cy="-2" r="1" fill="#2D2D3A" />
        <polygon points="5,-1 8,0 5,1" fill="#FF8C42" />
        {/* Wings spread */}
        <path d="M-4 -2 Q-10 -8 -6 -2" fill="#E6C84A" />
        <path d="M4 -2 Q10 -8 6 -2" fill="#E6C84A" />
      </g>
      {/* Hearts */}
      <path d="M165 105 C165 102 168 101 169 103 C170 101 173 102 173 105 C173 109 169 111 169 111 C169 111 165 109 165 105Z" fill="#FF8FAB" opacity="0.5" />
      <path d="M185 95 C185 93 187 92 188 94 C189 92 191 93 191 95 C191 98 188 99 188 99 C188 99 185 98 185 95Z" fill="#FF6B6B" opacity="0.4" />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════
// THE TREASURE MAP — 7 pages (s-6-adv-1)
// ═══════════════════════════════════════════════════════════

function TreasurePage1() {
  return (<svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
    <rect width="300" height="220" fill="#FFF3E0" />
    {/* Attic interior — warm dusty */}
    <rect x="0" y="0" width="300" height="80" fill="#D7CCC8" opacity="0.3" />
    <line x1="0" y1="80" x2="300" y2="80" stroke="#BCAAA4" strokeWidth="1" opacity="0.3" />
    {/* Wooden floor */}
    <rect x="0" y="80" width="300" height="140" fill="#D7CCC8" opacity="0.15" />
    {[0, 50, 100, 150, 200, 250].map((x) => <line key={x} x1={x} y1="80" x2={x} y2="220" stroke="#BCAAA4" strokeWidth="0.5" opacity="0.15" />)}
    {/* Old map on floor */}
    <g transform="translate(100, 100)">
      <rect x="0" y="0" width="100" height="70" rx="3" fill="#F5E6C8" stroke="#D4A050" strokeWidth="1" />
      <path d="M15 20 L35 12 L55 25 L75 15 L90 28" stroke="#8B6914" strokeWidth="1.5" fill="none" strokeDasharray="3 2" />
      <line x1="78" y1="50" x2="90" y2="62" stroke="#FF6B6B" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="90" y1="50" x2="78" y2="62" stroke="#FF6B6B" strokeWidth="2.5" strokeLinecap="round" />
    </g>
    {/* Max — boy looking at map */}
    <g transform="translate(70, 110)">
      <circle cx="0" cy="0" r="10" fill="#FFE0B2" />
      <path d="M-9 -3 Q0 -13 9 -3" fill="#5D4037" />
      <circle cx="-3" cy="-1" r="1.5" fill="#2D2D3A" />
      <circle cx="3" cy="-1" r="1.5" fill="#2D2D3A" />
      <path d="M-2 3 Q0 5 2 3" stroke="#2D2D3A" strokeWidth="0.8" fill="none" />
      <rect x="-8" y="12" width="16" height="20" rx="4" fill="#4ECDC4" />
    </g>
    {/* Dusty attic items */}
    <rect x="20" y="45" width="30" height="25" rx="3" fill="#8D6E63" opacity="0.3" />
    <circle cx="260" cy="55" r="12" fill="#BCAAA4" opacity="0.2" />
  </svg>);
}

function TreasurePage2() {
  return (<svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
    <DaySky /><rect width="300" height="220" fill="url(#spa-day)" />
    {/* Park path */}
    <ellipse cx="150" cy="200" rx="160" ry="30" fill="#66BB6A" opacity="0.5" />
    <path d="M50 200 Q100 170 150 175 Q200 180 250 200" stroke="#D4A050" strokeWidth="8" fill="none" opacity="0.3" />
    {/* Fountain */}
    <ellipse cx="200" cy="140" rx="20" ry="8" fill="#90A4AE" opacity="0.3" />
    <rect x="196" y="115" width="8" height="25" fill="#90A4AE" opacity="0.3" />
    <path d="M196 115 Q200 100 204 115" stroke="#45B7D1" strokeWidth="1.5" fill="none" opacity="0.4" />
    {/* Bridge in distance */}
    <path d="M240 165 Q260 150 280 165" stroke="#8D6E63" strokeWidth="3" fill="none" />
    {/* Trees */}
    <g transform="translate(60, 120)" aria-hidden="true"><rect x="-3" y="0" width="6" height="20" rx="2" fill="#5D4037" /><ellipse cx="0" cy="-8" rx="16" ry="14" fill="#2E7D32" /></g>
    <g transform="translate(130, 110)" aria-hidden="true"><rect x="-3" y="0" width="6" height="22" rx="2" fill="#5D4037" /><ellipse cx="0" cy="-8" rx="14" ry="12" fill="#388E3C" /></g>
    {/* Max with map */}
    <g transform="translate(100, 155)">
      <circle cx="0" cy="0" r="8" fill="#FFE0B2" />
      <path d="M-7 -2 Q0 -10 7 -2" fill="#5D4037" />
      <circle cx="-2" cy="-1" r="1.2" fill="#2D2D3A" />
      <circle cx="2" cy="-1" r="1.2" fill="#2D2D3A" />
      <rect x="-6" y="9" width="12" height="16" rx="3" fill="#4ECDC4" />
      <rect x="5" y="11" width="8" height="6" rx="1" fill="#F5E6C8" />
    </g>
  </svg>);
}

function TreasurePage3() {
  return (<svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
    <rect width="300" height="220" fill="#FFF8F0" />
    {/* Max's backpack — packing scene */}
    <rect x="60" y="60" width="180" height="120" rx="8" fill="#F5F5F5" opacity="0.5" />
    {/* Table */}
    <rect x="80" y="100" width="140" height="8" rx="2" fill="#8D6E63" opacity="0.4" />
    {/* Backpack */}
    <rect x="120" y="60" width="50" height="40" rx="8" fill="#FF8C42" />
    <rect x="125" y="62" width="40" height="30" rx="6" fill="#FFAB70" opacity="0.4" />
    <rect x="130" y="55" width="30" height="10" rx="3" fill="#E67E22" />
    {/* Items on table */}
    <rect x="95" y="85" width="8" height="16" rx="2" fill="#FFE66D" /> {/* Flashlight */}
    <circle cx="95" cy="83" r="4" fill="#FFF8DC" opacity="0.6" />
    <rect x="115" y="88" width="20" height="12" rx="3" fill="#D4A050" /> {/* Snacks */}
    <circle cx="180" cy="90" r="10" fill="#90A4AE" /> {/* Compass */}
    <circle cx="180" cy="90" r="7" fill="#F5F0E5" />
    <polygon points="180,82 181,90 179,90" fill="#FF6B6B" />
    {/* Max */}
    <g transform="translate(90, 130)">
      <circle cx="0" cy="0" r="9" fill="#FFE0B2" />
      <path d="M-8 -3 Q0 -12 8 -3" fill="#5D4037" />
      <circle cx="-2" cy="-1" r="1.5" fill="#2D2D3A" />
      <circle cx="3" cy="-1" r="1.5" fill="#2D2D3A" />
      <path d="M-2 3 Q0 5 2 3" stroke="#2D2D3A" strokeWidth="0.8" fill="none" />
      <rect x="-7" y="10" width="14" height="18" rx="4" fill="#4ECDC4" />
    </g>
  </svg>);
}

function TreasurePage4() {
  return (<svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
    <DaySky /><rect width="300" height="220" fill="url(#spa-day)" />
    <ellipse cx="150" cy="200" rx="160" ry="30" fill="#66BB6A" opacity="0.5" />
    {/* Fountain */}
    <ellipse cx="150" cy="130" rx="25" ry="10" fill="#90A4AE" opacity="0.4" />
    <rect x="146" y="100" width="8" height="30" fill="#90A4AE" opacity="0.3" />
    <path d="M146 100 Q150 82 154 100" stroke="#45B7D1" strokeWidth="2" fill="none" opacity="0.5" />
    {/* Max counting steps */}
    <g transform="translate(100, 150)">
      <circle cx="0" cy="0" r="8" fill="#FFE0B2" />
      <path d="M-7 -2 Q0 -10 7 -2" fill="#5D4037" />
      <circle cx="-2" cy="-1" r="1.2" fill="#2D2D3A" />
      <circle cx="2" cy="-1" r="1.2" fill="#2D2D3A" />
      <rect x="-6" y="9" width="12" height="16" rx="3" fill="#4ECDC4" />
      {/* Compass in hand */}
      <circle cx="10" cy="14" r="5" fill="#90A4AE" />
      <circle cx="10" cy="14" r="3" fill="#F5F0E5" />
    </g>
    {/* Footprint trail — dotted */}
    {[130, 145, 160, 175, 190].map((x, i) => (
      <ellipse key={i} cx={x} cy={155 - i * 2} rx="3" ry="4" fill="#8B6914" opacity={0.15 + i * 0.03} />
    ))}
    {/* Arrow pointing north */}
    <polygon points="80,70 85,60 90,70" fill="#FF6B6B" opacity="0.4" />
    <line x1="85" y1="70" x2="85" y2="82" stroke="#FF6B6B" strokeWidth="2" opacity="0.3" />
  </svg>);
}

function TreasurePage5() {
  return (<svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
    <DaySky /><rect width="300" height="220" fill="url(#spa-day)" />
    {/* Old bridge */}
    <path d="M60 120 Q150 90 240 120" stroke="#8D6E63" strokeWidth="6" fill="none" />
    <rect x="60" y="120" width="4" height="30" fill="#8D6E63" />
    <rect x="236" y="120" width="4" height="30" fill="#8D6E63" />
    {/* Water under bridge */}
    <path d="M30 155 Q80 148 130 155 Q180 162 230 155 Q260 148 290 155" stroke="#45B7D1" strokeWidth="2" fill="none" opacity="0.3" />
    {/* Wooden box */}
    <g transform="translate(140, 130)">
      <rect x="-15" y="-10" width="30" height="22" rx="3" fill="#8D6E63" />
      <rect x="-13" y="-8" width="26" height="18" rx="2" fill="#A1887F" opacity="0.4" />
      <line x1="-15" y1="-3" x2="15" y2="-3" stroke="#6D4C41" strokeWidth="1" opacity="0.4" />
      {/* Leaves on box */}
      <ellipse cx="-8" cy="-12" rx="5" ry="3" fill="#66BB6A" opacity="0.5" transform="rotate(-20,-8,-12)" />
      <ellipse cx="10" cy="-11" rx="4" ry="2.5" fill="#4CAF50" opacity="0.4" transform="rotate(15,10,-11)" />
    </g>
    {/* Max kneeling beside box */}
    <g transform="translate(100, 130)">
      <circle cx="0" cy="0" r="8" fill="#FFE0B2" />
      <path d="M-7 -2 Q0 -10 7 -2" fill="#5D4037" />
      <circle cx="-2" cy="-1" r="1.2" fill="#2D2D3A" />
      <circle cx="2" cy="-1" r="1.2" fill="#2D2D3A" />
      <path d="M-2 3 Q0 5 2 3" stroke="#2D2D3A" strokeWidth="0.8" fill="none" />
      <rect x="-6" y="9" width="12" height="12" rx="3" fill="#4ECDC4" />
    </g>
    <ellipse cx="150" cy="200" rx="160" ry="25" fill="#66BB6A" opacity="0.4" />
  </svg>);
}

function TreasurePage6() {
  return (<svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
    <rect width="300" height="220" fill="#FFF3E0" />
    {/* Open box close-up */}
    <g transform="translate(100, 60)">
      <rect x="0" y="20" width="100" height="60" rx="4" fill="#8D6E63" />
      <rect x="3" y="23" width="94" height="54" rx="3" fill="#A1887F" opacity="0.3" />
      {/* Open lid */}
      <rect x="0" y="-10" width="100" height="30" rx="4" fill="#8D6E63" transform="rotate(-15, 0, 20)" />
      {/* Note inside */}
      <rect x="15" y="35" width="60" height="30" rx="2" fill="#FFF8DC" />
      <line x1="22" y1="42" x2="68" y2="42" stroke="#D4A050" strokeWidth="0.8" opacity="0.4" />
      <line x1="22" y1="48" x2="60" y2="48" stroke="#D4A050" strokeWidth="0.8" opacity="0.3" />
      <line x1="22" y1="54" x2="55" y2="54" stroke="#D4A050" strokeWidth="0.8" opacity="0.3" />
      {/* Gold coin */}
      <circle cx="80" cy="50" r="10" fill="#FFD93D" stroke="#E6B800" strokeWidth="1" />
      <circle cx="80" cy="50" r="6" fill="#FFE66D" opacity="0.5" />
    </g>
    {/* Sparkles around the treasure */}
    {[[80, 50], [220, 60], [160, 40], [130, 130]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={2} fill="#FFE66D" opacity={0.4 + i * 0.08} />
    ))}
    {/* Max — amazed */}
    <g transform="translate(70, 140)">
      <circle cx="0" cy="0" r="10" fill="#FFE0B2" />
      <path d="M-9 -3 Q0 -13 9 -3" fill="#5D4037" />
      <ellipse cx="-3" cy="-2" rx="2" ry="2.5" fill="white" />
      <ellipse cx="3" cy="-2" rx="2" ry="2.5" fill="white" />
      <circle cx="-3" cy="-2" r="1.2" fill="#2D2D3A" />
      <circle cx="3" cy="-2" r="1.2" fill="#2D2D3A" />
      <ellipse cx="0" cy="4" rx="3" ry="4" fill="#2D2D3A" />
    </g>
  </svg>);
}

function TreasurePage7() {
  return (<svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
    <DaySky /><rect width="300" height="220" fill="url(#spa-day)" />
    <ellipse cx="150" cy="200" rx="160" ry="30" fill="#66BB6A" opacity="0.5" />
    <circle cx="250" cy="35" r="18" fill="#FFE66D" />
    {/* Max walking home — happy, gold coin in hand */}
    <g transform="translate(150, 130)">
      <circle cx="0" cy="0" r="10" fill="#FFE0B2" />
      <path d="M-9 -3 Q0 -13 9 -3" fill="#5D4037" />
      <path d="M-4 -2 Q-2 -5 0 -2" stroke="#2D2D3A" strokeWidth="1.2" fill="none" />
      <path d="M1 -2 Q3 -5 5 -2" stroke="#2D2D3A" strokeWidth="1.2" fill="none" />
      <path d="M-3 3 Q0 6 3 3" stroke="#2D2D3A" strokeWidth="1.2" fill="none" />
      <rect x="-8" y="12" width="16" height="20" rx="4" fill="#4ECDC4" />
      {/* Backpack */}
      <rect x="-14" y="14" width="8" height="14" rx="3" fill="#FF8C42" />
      {/* Gold coin held up */}
      <line x1="8" y1="16" x2="18" y2="6" stroke="#FFE0B2" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="20" cy="4" r="5" fill="#FFD93D" stroke="#E6B800" strokeWidth="0.8" />
    </g>
    {/* Sparkle */}
    <circle cx="175" cy="125" r="2" fill="#FFE66D" opacity="0.5" />
    <circle cx="130" cy="118" r="1.5" fill="#FFE66D" opacity="0.4" />
  </svg>);
}

// ═══════════════════════════════════════════════════════════
// THE NEW KID — 7 pages (s-6-fri-1)
// ═══════════════════════════════════════════════════════════

function NewKidPage1() {
  return (<svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
    <rect width="300" height="220" fill="#E3F2FD" />
    {/* Classroom */}
    <rect x="20" y="20" width="260" height="130" rx="4" fill="#FFECB3" opacity="0.3" />
    {/* Chalkboard */}
    <rect x="100" y="30" width="100" height="50" rx="3" fill="#2E7D32" opacity="0.4" />
    {/* Desks row */}
    {[60, 140, 220].map((x) => <rect key={x} x={x-15} y="100" width="30" height="15" rx="2" fill="#8D6E63" opacity="0.3" />)}
    {/* Sam — new kid, nervous, standing at door */}
    <g transform="translate(45, 100)">
      <circle cx="0" cy="0" r="9" fill="#FFE0B2" />
      <path d="M-8 -3 Q0 -12 8 -3" fill="#8B6914" />
      <circle cx="-3" cy="-1" r="1.5" fill="#2D2D3A" />
      <circle cx="3" cy="-1" r="1.5" fill="#2D2D3A" />
      <path d="M-2 3 Q0 2 2 3" stroke="#2D2D3A" strokeWidth="0.8" fill="none" />
      <rect x="-7" y="10" width="14" height="18" rx="4" fill="#4ECDC4" />
      <rect x="-11" y="12" width="6" height="14" rx="3" fill="#FF8C42" />
    </g>
    {/* Floor */}
    <rect x="0" y="150" width="300" height="70" fill="#A8E6CF" opacity="0.2" />
  </svg>);
}

function NewKidPage2() {
  return (<svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
    <rect width="300" height="220" fill="#FFF8F0" />
    {/* Cafeteria table */}
    <rect x="80" y="100" width="140" height="8" rx="2" fill="#8D6E63" opacity="0.4" />
    <rect x="90" y="108" width="4" height="40" fill="#8D6E63" opacity="0.3" />
    <rect x="206" y="108" width="4" height="40" fill="#8D6E63" opacity="0.3" />
    {/* Lunch tray */}
    <rect x="130" y="85" width="35" height="15" rx="3" fill="#E0E0E0" />
    <circle cx="140" cy="88" r="4" fill="#FF8C42" opacity="0.4" />
    <rect x="150" y="86" width="10" height="6" rx="1" fill="#FFE66D" opacity="0.4" />
    {/* Sam alone */}
    <g transform="translate(150, 70)">
      <circle cx="0" cy="0" r="9" fill="#FFE0B2" />
      <path d="M-8 -3 Q0 -12 8 -3" fill="#8B6914" />
      <circle cx="-3" cy="-1" r="1.5" fill="#2D2D3A" />
      <circle cx="3" cy="-1" r="1.5" fill="#2D2D3A" />
      <path d="M-2 3 Q0 2 2 3" stroke="#2D2D3A" strokeWidth="0.8" fill="none" />
      <rect x="-7" y="10" width="14" height="14" rx="4" fill="#4ECDC4" />
    </g>
    {/* Empty chairs around */}
    <rect x="100" y="88" width="12" height="12" rx="2" fill="#BDBDBD" opacity="0.2" />
    <rect x="190" y="88" width="12" height="12" rx="2" fill="#BDBDBD" opacity="0.2" />
  </svg>);
}

function NewKidPage3() {
  return (<svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
    <rect width="300" height="220" fill="#FFF8F0" />
    <rect x="80" y="110" width="140" height="8" rx="2" fill="#8D6E63" opacity="0.4" />
    {/* Sam */}
    <g transform="translate(130, 80)">
      <circle cx="0" cy="0" r="9" fill="#FFE0B2" />
      <path d="M-8 -3 Q0 -12 8 -3" fill="#8B6914" />
      <circle cx="-3" cy="-1" r="1.5" fill="#2D2D3A" />
      <circle cx="3" cy="-1" r="1.5" fill="#2D2D3A" />
      <path d="M-2 3 Q0 5 2 3" stroke="#2D2D3A" strokeWidth="0.8" fill="none" />
      <rect x="-7" y="10" width="14" height="14" rx="4" fill="#4ECDC4" />
    </g>
    {/* Emma — walking over, waving */}
    <g transform="translate(200, 75)">
      <circle cx="0" cy="0" r="9" fill="#FFE0B2" />
      <path d="M-8 -3 Q0 -12 8 -3" fill="#5D4037" />
      <circle cx="-10" cy="-4" r="4" fill="#5D4037" />
      <circle cx="10" cy="-4" r="4" fill="#5D4037" />
      <circle cx="-3" cy="-1" r="1.5" fill="#2D2D3A" />
      <circle cx="3" cy="-1" r="1.5" fill="#2D2D3A" />
      <path d="M-3 3 Q0 6 3 3" stroke="#2D2D3A" strokeWidth="0.8" fill="none" />
      <rect x="-7" y="10" width="14" height="14" rx="4" fill="#FF8FAB" />
      {/* Waving hand */}
      <line x1="7" y1="14" x2="16" y2="4" stroke="#FFE0B2" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="17" cy="3" r="3" fill="#FFE0B2" />
    </g>
  </svg>);
}

function NewKidPage4() {
  return (<svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
    <rect width="300" height="220" fill="#FFF8F0" />
    <rect x="80" y="110" width="140" height="8" rx="2" fill="#8D6E63" opacity="0.4" />
    {/* Sam and Emma sitting together at table */}
    <g transform="translate(120, 80)">
      <circle cx="0" cy="0" r="9" fill="#FFE0B2" />
      <path d="M-8 -3 Q0 -12 8 -3" fill="#8B6914" />
      <circle cx="-3" cy="-1" r="1.5" fill="#2D2D3A" />
      <circle cx="3" cy="-1" r="1.5" fill="#2D2D3A" />
      <path d="M-2 3 Q0 5 2 3" stroke="#2D2D3A" strokeWidth="0.8" fill="none" />
      <rect x="-7" y="10" width="14" height="14" rx="4" fill="#4ECDC4" />
    </g>
    <g transform="translate(180, 80)">
      <circle cx="0" cy="0" r="9" fill="#FFE0B2" />
      <path d="M-8 -3 Q0 -12 8 -3" fill="#5D4037" />
      <circle cx="-10" cy="-4" r="4" fill="#5D4037" />
      <circle cx="10" cy="-4" r="4" fill="#5D4037" />
      <circle cx="-3" cy="-1" r="1.5" fill="#2D2D3A" />
      <circle cx="3" cy="-1" r="1.5" fill="#2D2D3A" />
      <path d="M-2 3 Q0 5 2 3" stroke="#2D2D3A" strokeWidth="0.8" fill="none" />
      <rect x="-7" y="10" width="14" height="14" rx="4" fill="#FF8FAB" />
    </g>
    {/* Lunch trays */}
    <rect x="105" y="98" width="25" height="10" rx="2" fill="#E0E0E0" />
    <rect x="170" y="98" width="25" height="10" rx="2" fill="#E0E0E0" />
    {/* Sparkles — friendship forming */}
    <circle cx="150" cy="65" r="2" fill="#FFE66D" opacity="0.4" />
    <circle cx="155" cy="72" r="1.5" fill="#FFE66D" opacity="0.3" />
  </svg>);
}

function NewKidPage5() {
  return (<svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
    <DaySky /><rect width="300" height="220" fill="url(#spa-day)" />
    <ellipse cx="150" cy="200" rx="160" ry="30" fill="#66BB6A" opacity="0.5" />
    {/* Playground */}
    <rect x="220" y="130" width="4" height="40" fill="#90A4AE" opacity="0.3" />
    <rect x="210" y="128" width="24" height="4" rx="2" fill="#90A4AE" opacity="0.3" />
    {/* Sam drawing */}
    <g transform="translate(100, 140)">
      <circle cx="0" cy="0" r="8" fill="#FFE0B2" />
      <path d="M-7 -2 Q0 -10 7 -2" fill="#8B6914" />
      <circle cx="-2" cy="-1" r="1.2" fill="#2D2D3A" />
      <circle cx="2" cy="-1" r="1.2" fill="#2D2D3A" />
      <rect x="-6" y="9" width="12" height="14" rx="3" fill="#4ECDC4" />
      {/* Sketchpad */}
      <rect x="5" y="12" width="12" height="10" rx="1" fill="white" />
    </g>
    {/* Emma drawing */}
    <g transform="translate(190, 140)">
      <circle cx="0" cy="0" r="8" fill="#FFE0B2" />
      <path d="M-7 -2 Q0 -10 7 -2" fill="#5D4037" />
      <circle cx="-2" cy="-1" r="1.2" fill="#2D2D3A" />
      <circle cx="2" cy="-1" r="1.2" fill="#2D2D3A" />
      <rect x="-6" y="9" width="12" height="14" rx="3" fill="#FF8FAB" />
      <rect x="5" y="12" width="12" height="10" rx="1" fill="white" />
    </g>
    {/* Dinosaur doodle between them */}
    <g transform="translate(145, 155)" opacity="0.5" aria-hidden="true">
      <path d="M-6 5 L-6 -2 L-3 -5 L0 -3 L3 -5 L6 -2 L6 5 L3 8 L-3 8Z" fill="#6BCB77" />
      <circle cx="-3" cy="-1" r="1" fill="#2D2D3A" />
    </g>
  </svg>);
}

function NewKidPage6() {
  return (<svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
    <DaySky /><rect width="300" height="220" fill="url(#spa-day)" />
    <ellipse cx="150" cy="200" rx="160" ry="30" fill="#66BB6A" opacity="0.5" />
    {/* Sam and Emma showing each other their drawings */}
    <g transform="translate(120, 130)">
      <circle cx="0" cy="0" r="9" fill="#FFE0B2" />
      <path d="M-8 -3 Q0 -12 8 -3" fill="#8B6914" />
      <path d="M-3 -1 Q-1 -4 1 -1" stroke="#2D2D3A" strokeWidth="1.2" fill="none" />
      <path d="M2 -1 Q4 -4 6 -1" stroke="#2D2D3A" strokeWidth="1.2" fill="none" />
      <path d="M-2 3 Q0 5 2 3" stroke="#2D2D3A" strokeWidth="1" fill="none" />
      <rect x="-7" y="10" width="14" height="16" rx="4" fill="#4ECDC4" />
      {/* Holding up T-Rex drawing */}
      <rect x="8" y="4" width="16" height="12" rx="1" fill="white" />
      <path d="M12 10 L12 8 L15 6 L18 8 L18 12" stroke="#6BCB77" strokeWidth="1" fill="none" />
    </g>
    <g transform="translate(190, 130)">
      <circle cx="0" cy="0" r="9" fill="#FFE0B2" />
      <path d="M-8 -3 Q0 -12 8 -3" fill="#5D4037" />
      <circle cx="-10" cy="-4" r="4" fill="#5D4037" />
      <circle cx="10" cy="-4" r="4" fill="#5D4037" />
      <path d="M-3 -1 Q-1 -4 1 -1" stroke="#2D2D3A" strokeWidth="1.2" fill="none" />
      <path d="M2 -1 Q4 -4 6 -1" stroke="#2D2D3A" strokeWidth="1.2" fill="none" />
      <path d="M-2 3 Q0 5 2 3" stroke="#2D2D3A" strokeWidth="1" fill="none" />
      <rect x="-7" y="10" width="14" height="16" rx="4" fill="#FF8FAB" />
      {/* Holding up Triceratops drawing */}
      <rect x="-24" y="4" width="16" height="12" rx="1" fill="white" />
      <path d="M-20 12 L-18 8 L-14 6 L-12 8 Q-10 10 -12 12" stroke="#A78BFA" strokeWidth="1" fill="none" />
    </g>
  </svg>);
}

function NewKidPage7() {
  return (<svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
    <DaySky /><rect width="300" height="220" fill="url(#spa-day)" />
    <ellipse cx="150" cy="200" rx="160" ry="30" fill="#66BB6A" opacity="0.5" />
    <circle cx="250" cy="35" r="18" fill="#FFE66D" />
    {/* Sam and Emma walking together — friends */}
    <g transform="translate(130, 130)">
      <circle cx="0" cy="0" r="9" fill="#FFE0B2" />
      <path d="M-8 -3 Q0 -12 8 -3" fill="#8B6914" />
      <path d="M-3 -1 Q-1 -4 1 -1" stroke="#2D2D3A" strokeWidth="1.2" fill="none" />
      <path d="M2 -1 Q4 -4 6 -1" stroke="#2D2D3A" strokeWidth="1.2" fill="none" />
      <path d="M-2 3 Q0 5 2 3" stroke="#2D2D3A" strokeWidth="1" fill="none" />
      <rect x="-7" y="10" width="14" height="18" rx="4" fill="#4ECDC4" />
    </g>
    <g transform="translate(170, 130)">
      <circle cx="0" cy="0" r="9" fill="#FFE0B2" />
      <path d="M-8 -3 Q0 -12 8 -3" fill="#5D4037" />
      <circle cx="-10" cy="-4" r="4" fill="#5D4037" />
      <circle cx="10" cy="-4" r="4" fill="#5D4037" />
      <path d="M-3 -1 Q-1 -4 1 -1" stroke="#2D2D3A" strokeWidth="1.2" fill="none" />
      <path d="M2 -1 Q4 -4 6 -1" stroke="#2D2D3A" strokeWidth="1.2" fill="none" />
      <path d="M-2 3 Q0 5 2 3" stroke="#2D2D3A" strokeWidth="1" fill="none" />
      <rect x="-7" y="10" width="14" height="18" rx="4" fill="#FF8FAB" />
    </g>
    {/* Heart above */}
    <path d="M150 100 C150 96 155 95 156 97 C157 95 162 96 162 100 C162 105 156 108 156 108 C156 108 150 105 150 100Z" fill="#FF8FAB" opacity="0.5" />
  </svg>);
}

// ═══════════════════════════════════════════════════════════
// THE WATER CYCLE — 7 pages (s-6-nat-1)
// ═══════════════════════════════════════════════════════════

function WaterPage1() {
  return (<svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
    <DaySky /><rect width="300" height="220" fill="url(#spa-day)" />
    {/* Rain drops — question: where does rain come from? */}
    {[[50, 30], [100, 40], [150, 25], [200, 35], [250, 28]].map(([x, y], i) => (
      <path key={i} d={`M${x} ${y} L${(x as number)-1.5} ${(y as number)+8} Q${x} ${(y as number)+11} ${(x as number)+1.5} ${(y as number)+8}Z`} fill="#45B7D1" opacity={0.4 + i * 0.05} />
    ))}
    {/* Cloud */}
    <ellipse cx="150" cy="70" rx="35" ry="16" fill="#B0BEC5" opacity="0.5" />
    <ellipse cx="135" cy="74" rx="22" ry="12" fill="#90A4AE" opacity="0.4" />
    <ellipse cx="165" cy="74" rx="22" ry="12" fill="#90A4AE" opacity="0.4" />
    {/* Meadow */}
    <ellipse cx="150" cy="200" rx="160" ry="30" fill="#66BB6A" opacity="0.4" />
    {/* Question mark made of water drops */}
    <path d="M140 130 Q140 120 150 120 Q160 120 160 130 Q160 135 150 138" stroke="#45B7D1" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.4" />
    <circle cx="150" cy="148" r="2.5" fill="#45B7D1" opacity="0.4" />
  </svg>);
}

function WaterPage2() {
  return (<svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
    <DaySky /><rect width="300" height="220" fill="url(#spa-day)" />
    {/* Bright sun heating water */}
    <circle cx="150" cy="35" r="28" fill="#FFE66D" />
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a) => (
      <line key={a} x1={150+Math.cos(a*Math.PI/180)*32} y1={35+Math.sin(a*Math.PI/180)*32} x2={150+Math.cos(a*Math.PI/180)*40} y2={35+Math.sin(a*Math.PI/180)*40} stroke="#FFE66D" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    ))}
    {/* Ocean / lake */}
    <ellipse cx="150" cy="180" rx="140" ry="40" fill="#45B7D1" opacity="0.35" />
    <path d="M20 165 Q60 160 100 165 Q140 170 180 165 Q220 160 260 165 Q280 168 290 165" stroke="#87CEEB" strokeWidth="1.5" fill="none" opacity="0.3" />
    {/* Heat waves/vapor rising */}
    {[80, 130, 180, 220].map((x, i) => (
      <path key={i} d={`M${x} 155 Q${x+5} 140 ${x} 125 Q${x-5} 110 ${x} 95`} stroke="#45B7D1" strokeWidth="1.5" fill="none" strokeDasharray="4 3" opacity={0.2 + i * 0.05} />
    ))}
  </svg>);
}

function WaterPage3() {
  return (<svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
    <DaySky /><rect width="300" height="220" fill="url(#spa-day)" />
    {/* Vapor arrows going up */}
    {[80, 150, 220].map((x, i) => (
      <g key={i}>
        <path d={`M${x} 180 Q${x+4} 140 ${x} 100 Q${x-4} 60 ${x} 30`} stroke="#45B7D1" strokeWidth="2" fill="none" strokeDasharray="5 3" opacity={0.3 + i * 0.05} />
        <polygon points={`${x-4},35 ${x},22 ${x+4},35`} fill="#45B7D1" opacity={0.3 + i * 0.05} />
      </g>
    ))}
    {/* Water body at bottom */}
    <ellipse cx="150" cy="195" rx="130" ry="25" fill="#45B7D1" opacity="0.25" />
    {/* Tiny water droplets along arrows */}
    {[[85, 120], [155, 80], [215, 100]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={2} fill="#87CEEB" opacity={0.3 + i * 0.05} />
    ))}
  </svg>);
}

function WaterPage4() {
  return (<svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
    <DaySky /><rect width="300" height="220" fill="url(#spa-day)" />
    {/* Big cloud forming */}
    <ellipse cx="150" cy="60" rx="50" ry="22" fill="white" opacity="0.9" />
    <ellipse cx="125" cy="65" rx="35" ry="18" fill="white" opacity="0.85" />
    <ellipse cx="175" cy="65" rx="35" ry="18" fill="white" opacity="0.85" />
    <ellipse cx="150" cy="75" rx="45" ry="15" fill="#F5F5F5" opacity="0.7" />
    {/* Tiny drops forming in cloud */}
    {[[130, 55], [145, 50], [160, 55], [170, 52], [140, 60]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={1.5} fill="#87CEEB" opacity={0.3 + i * 0.05} />
    ))}
    {/* Vapor still rising */}
    <path d="M100 180 Q105 140 100 100" stroke="#45B7D1" strokeWidth="1" fill="none" strokeDasharray="3 3" opacity="0.2" />
    <path d="M200 180 Q195 140 200 100" stroke="#45B7D1" strokeWidth="1" fill="none" strokeDasharray="3 3" opacity="0.2" />
    {/* Ground */}
    <ellipse cx="150" cy="200" rx="140" ry="25" fill="#66BB6A" opacity="0.4" />
  </svg>);
}

function WaterPage5() {
  return (<svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
    <DaySky /><rect width="300" height="220" fill="url(#spa-day)" />
    {/* Heavy dark cloud */}
    <ellipse cx="150" cy="50" rx="55" ry="25" fill="#90A4AE" opacity="0.7" />
    <ellipse cx="120" cy="55" rx="40" ry="20" fill="#78909C" opacity="0.6" />
    <ellipse cx="180" cy="55" rx="40" ry="20" fill="#78909C" opacity="0.6" />
    {/* Condensation drops inside */}
    {[[130, 42], [150, 38], [170, 42], [140, 48], [160, 48]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={2} fill="#45B7D1" opacity={0.3 + i * 0.05} />
    ))}
    <ellipse cx="150" cy="200" rx="140" ry="25" fill="#66BB6A" opacity="0.4" />
  </svg>);
}

function WaterPage6() {
  return (<svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
    <rect width="300" height="220" fill="#CFD8DC" opacity="0.2" />
    {/* Heavy cloud releasing rain */}
    <ellipse cx="120" cy="40" rx="45" ry="20" fill="#78909C" opacity="0.6" />
    <ellipse cx="100" cy="44" rx="30" ry="15" fill="#90A4AE" opacity="0.5" />
    {/* Rain drops */}
    {[[70, 65], [90, 60], [110, 68], [130, 62], [150, 70], [100, 80], [120, 75], [140, 82]].map(([x, y], i) => (
      <path key={i} d={`M${x} ${y} L${(x as number)-1} ${(y as number)+8} Q${x} ${(y as number)+11} ${(x as number)+1} ${(y as number)+8}Z`} fill="#45B7D1" opacity={0.3 + (i % 3) * 0.1} />
    ))}
    {/* Snow cloud on right */}
    <ellipse cx="230" cy="45" rx="35" ry="16" fill="#B0BEC5" opacity="0.5" />
    {/* Snowflakes */}
    {[[210, 65], [230, 70], [250, 68], [220, 80]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={2} fill="white" opacity={0.5 + i * 0.08} />
    ))}
    {/* Mountains getting snow */}
    <polygon points="200,180 240,100 280,180" fill="#78909C" opacity="0.3" />
    <polygon points="220,115 240,100 260,115" fill="white" opacity="0.4" />
    {/* Green meadow getting rain */}
    <ellipse cx="100" cy="200" rx="110" ry="25" fill="#66BB6A" opacity="0.4" />
  </svg>);
}

function WaterPage7() {
  return (<svg viewBox="0 0 300 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden="true">
    <DaySky /><rect width="300" height="220" fill="url(#spa-day)" />
    {/* Complete cycle visualization */}
    {/* Sun */}
    <circle cx="250" cy="30" r="18" fill="#FFE66D" />
    {/* Ocean */}
    <ellipse cx="80" cy="190" rx="70" ry="20" fill="#45B7D1" opacity="0.3" />
    {/* Evaporation up-arrow */}
    <path d="M80 170 Q85 130 80 90" stroke="#45B7D1" strokeWidth="2" fill="none" strokeDasharray="4 3" opacity="0.4" />
    <polygon points="76,95 80,82 84,95" fill="#45B7D1" opacity="0.4" />
    {/* Cloud */}
    <ellipse cx="150" cy="55" rx="35" ry="15" fill="#B0BEC5" opacity="0.4" />
    {/* Rain down-arrow */}
    <path d="M180 70 Q175 110 180 150" stroke="#45B7D1" strokeWidth="2" fill="none" strokeDasharray="4 3" opacity="0.4" />
    <polygon points="176,145 180,158 184,145" fill="#45B7D1" opacity="0.4" />
    {/* River flowing back to ocean */}
    <path d="M190 165 Q160 175 130 180 Q100 185 80 185" stroke="#45B7D1" strokeWidth="3" fill="none" opacity="0.3" />
    {/* Cycle arrow */}
    <path d="M60 170 Q40 130 60 90 Q80 50 130 45" stroke="#FF8C42" strokeWidth="2" fill="none" opacity="0.3" />
    <polygon points="127,42 135,45 128,48" fill="#FF8C42" opacity="0.3" />
    {/* Green land */}
    <ellipse cx="220" cy="195" rx="80" ry="20" fill="#66BB6A" opacity="0.4" />
  </svg>);
}

// ═══════════════════════════════════════════════════════════
// PAGE ART MAP
// ═══════════════════════════════════════════════════════════

const pageArtMap: Record<string, (() => ReactNode)[]> = {
  's-2-ani-1': [DuckPage1, DuckPage2, DuckPage3, DuckPage4, DuckPage5],
  's-2-bed-1': [MoonPage1, MoonPage2, MoonPage3, MoonPage4, MoonPage5],
  's-2-fri-1': [FriendPage1, FriendPage2, FriendPage3, FriendPage4, FriendPage5],
  's-4-adv-1': [GardenPage1, GardenPage2, GardenPage3, GardenPage4, GardenPage5, GardenPage6, GardenPage7],
  's-4-nat-1': [RainPage1, RainPage2, RainPage3, RainPage4, RainPage5, RainPage6, RainPage7],
  's-4-ani-1': [CatPage1, CatPage2, CatPage3, CatPage4, CatPage5, CatPage6, CatPage7],
  's-6-adv-1': [TreasurePage1, TreasurePage2, TreasurePage3, TreasurePage4, TreasurePage5, TreasurePage6, TreasurePage7],
  's-6-fri-1': [NewKidPage1, NewKidPage2, NewKidPage3, NewKidPage4, NewKidPage5, NewKidPage6, NewKidPage7],
  's-6-nat-1': [WaterPage1, WaterPage2, WaterPage3, WaterPage4, WaterPage5, WaterPage6, WaterPage7],
};

/**
 * Get the full-page narrative illustration for a specific story page.
 * Returns the scene element or null if no art exists for this story/page.
 */
export function getStoryPageArt(storyId: string, pageIndex: number): ReactNode | null {
  const pages = pageArtMap[storyId];
  if (!pages || pageIndex < 0 || pageIndex >= pages.length) return null;
  const Page = pages[pageIndex];
  return <Page />;
}

/**
 * Check if a story has per-page narrative art.
 */
export function hasStoryPageArt(storyId: string): boolean {
  return storyId in pageArtMap;
}
