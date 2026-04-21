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
// PAGE ART MAP
// ═══════════════════════════════════════════════════════════

const pageArtMap: Record<string, (() => ReactNode)[]> = {
  's-2-ani-1': [DuckPage1, DuckPage2, DuckPage3, DuckPage4, DuckPage5],
  's-2-bed-1': [MoonPage1, MoonPage2, MoonPage3, MoonPage4, MoonPage5],
  's-2-fri-1': [FriendPage1, FriendPage2, FriendPage3, FriendPage4, FriendPage5],
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
