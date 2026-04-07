// ── Scene Background Components ─────────────────────────────────
// 6 reusable background wrappers for different content moods.
// Each uses inline SVG and CSS gradients, respects reduced-motion
// and provides a `reduced` prop for low-power devices.

import type { ReactNode, CSSProperties } from 'react';

interface BgProps {
  className?: string;
  children?: ReactNode;
  /** Render a simplified version for low-power devices */
  reduced?: boolean;
}

const wrapperStyle: CSSProperties = {
  position: 'relative',
  minHeight: '100dvh',
  overflow: 'hidden',
};

const svgLayerStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
};

const contentStyle: CSSProperties = {
  position: 'relative',
  zIndex: 20,
  minHeight: '100dvh',
};

// ── 1. Sky Gradient Background ──────────────────────────────────
// Gentle blue sky with soft cloud shapes via radial gradients.

export function SkyGradientBg({ className = '', children, reduced }: BgProps) {
  return (
    <div
      className={className}
      style={{
        ...wrapperStyle,
        background: 'linear-gradient(180deg, #74B9FF 0%, #A8D8FF 40%, #D6ECFF 70%, #F0F8FF 100%)',
      }}
    >
      {/* Cloud layer */}
      {!reduced && (
        <svg style={svgLayerStyle} viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="cloud1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="cloud2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
              <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Large cloud cluster - left */}
          <ellipse cx="200" cy="180" rx="180" ry="70" fill="url(#cloud1)">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 20,0; 0,0"
              dur="25s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="260" cy="160" rx="120" ry="55" fill="url(#cloud1)" />
          <ellipse cx="150" cy="170" rx="100" ry="50" fill="url(#cloud2)" />

          {/* Cloud cluster - right */}
          <ellipse cx="850" cy="120" rx="160" ry="60" fill="url(#cloud1)">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; -15,0; 0,0"
              dur="30s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="920" cy="110" rx="100" ry="45" fill="url(#cloud2)" />
          <ellipse cx="790" cy="125" rx="90" ry="40" fill="url(#cloud2)" />

          {/* Small floating cloud - center top */}
          <ellipse cx="550" cy="80" rx="100" ry="40" fill="url(#cloud2)">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 25,3; 0,0"
              dur="35s"
              repeatCount="indefinite"
            />
          </ellipse>

          {/* Distant small cloud */}
          <ellipse cx="1050" cy="250" rx="80" ry="30" fill="url(#cloud2)" opacity="0.5">
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; -10,0; 0,0"
              dur="20s"
              repeatCount="indefinite"
            />
          </ellipse>
        </svg>
      )}

      {/* Simplified cloud for reduced mode */}
      {reduced && (
        <svg style={svgLayerStyle} viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="cloudSimple" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="250" cy="180" rx="180" ry="60" fill="url(#cloudSimple)" />
          <ellipse cx="850" cy="130" rx="150" ry="55" fill="url(#cloudSimple)" />
        </svg>
      )}

      <div style={contentStyle}>{children}</div>
    </div>
  );
}

// ── 2. Classroom Background ─────────────────────────────────────
// Warm, playful classroom with shelves, soft shapes, and learning
// tool silhouettes as decorative elements.

export function ClassroomBg({ className = '', children, reduced }: BgProps) {
  return (
    <div
      className={className}
      style={{
        ...wrapperStyle,
        background: 'linear-gradient(180deg, #FFF8F0 0%, #FFECD2 60%, #FFE0B2 100%)',
      }}
    >
      <svg style={svgLayerStyle} viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        {/* Floor */}
        <rect x="0" y="620" width="1200" height="180" rx="0" fill="#F5D6BA" opacity="0.5" />
        <rect x="0" y="625" width="1200" height="3" rx="1.5" fill="#E8C4A0" opacity="0.4" />

        {/* Bookshelf - left */}
        <rect x="40" y="300" width="180" height="320" rx="12" fill="#DEB887" opacity="0.25" />
        <rect x="50" y="320" width="160" height="8" rx="4" fill="#C9A96E" opacity="0.3" />
        <rect x="50" y="400" width="160" height="8" rx="4" fill="#C9A96E" opacity="0.3" />
        <rect x="50" y="480" width="160" height="8" rx="4" fill="#C9A96E" opacity="0.3" />
        {/* Books on shelf */}
        <rect x="60" y="335" width="18" height="58" rx="3" fill="#FF6B6B" opacity="0.2" />
        <rect x="82" y="340" width="16" height="53" rx="3" fill="#4ECDC4" opacity="0.2" />
        <rect x="102" y="332" width="20" height="61" rx="3" fill="#A78BFA" opacity="0.2" />
        <rect x="126" y="338" width="14" height="55" rx="3" fill="#FFE66D" opacity="0.2" />
        <rect x="144" y="334" width="18" height="59" rx="3" fill="#6BCB77" opacity="0.2" />

        {!reduced && (
          <>
            {/* Chalkboard silhouette - center */}
            <rect x="400" y="180" width="400" height="260" rx="16" fill="#5D7B6F" opacity="0.12" />
            <rect x="410" y="190" width="380" height="240" rx="12" fill="#4A6B5D" opacity="0.1" />
            {/* Chalk marks */}
            <line x1="440" y1="250" x2="560" y2="250" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.15" />
            <line x1="440" y1="280" x2="520" y2="280" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.12" />
            <text x="620" y="320" fontFamily="sans-serif" fontSize="40" fill="#FFFFFF" opacity="0.1">ABC</text>

            {/* Globe silhouette - right */}
            <circle cx="1000" cy="420" r="55" fill="#74B9FF" opacity="0.12" />
            <ellipse cx="1000" cy="420" rx="55" ry="20" fill="none" stroke="#74B9FF" strokeWidth="1.5" opacity="0.1" />
            <line x1="1000" y1="365" x2="1000" y2="475" stroke="#74B9FF" strokeWidth="1.5" opacity="0.1" />
            {/* Globe stand */}
            <line x1="1000" y1="475" x2="1000" y2="530" stroke="#C9A96E" strokeWidth="3" strokeLinecap="round" opacity="0.15" />
            <ellipse cx="1000" cy="535" rx="30" ry="8" fill="#C9A96E" opacity="0.12" />

            {/* Pencil silhouette */}
            <g transform="translate(1100, 350) rotate(15)" opacity="0.12">
              <rect x="-6" y="0" width="12" height="80" rx="3" fill="#FFD93D" />
              <polygon points="-6,80 6,80 0,95" fill="#F5D6BA" />
              <rect x="-6" y="0" width="12" height="12" rx="3" fill="#FF8C42" />
            </g>

            {/* Ruler silhouette */}
            <g transform="translate(80, 560) rotate(-5)" opacity="0.1">
              <rect x="0" y="0" width="140" height="20" rx="4" fill="#74B9FF" />
              {[0, 20, 40, 60, 80, 100, 120].map((tick) => (
                <line key={tick} x1={tick + 10} y1="0" x2={tick + 10} y2="8" stroke="#4A90D9" strokeWidth="1" />
              ))}
            </g>

            {/* Star decorations - scattered */}
            {[
              { x: 300, y: 150, s: 12 },
              { x: 900, y: 200, s: 10 },
              { x: 700, y: 100, s: 8 },
              { x: 1100, y: 250, s: 14 },
            ].map(({ x, y, s }, i) => (
              <polygon
                key={i}
                points={starPoints(x, y, s)}
                fill="#FFD93D"
                opacity="0.15"
              />
            ))}
          </>
        )}
      </svg>

      <div style={contentStyle}>{children}</div>
    </div>
  );
}

/** Generate SVG star polygon points */
function starPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 5; i++) {
    const outerAngle = (Math.PI / 2) * -1 + (i * 2 * Math.PI) / 5;
    const innerAngle = outerAngle + Math.PI / 5;
    pts.push(`${cx + r * Math.cos(outerAngle)},${cy + r * Math.sin(outerAngle)}`);
    pts.push(`${cx + (r * 0.4) * Math.cos(innerAngle)},${cy + (r * 0.4) * Math.sin(innerAngle)}`);
  }
  return pts.join(' ');
}

// ── 3. Bedtime Stars Background ─────────────────────────────────
// Deep indigo sky with twinkling stars. Animated via CSS keyframes,
// fully respects prefers-reduced-motion.

const twinkleKeyframes = `
@keyframes twinkle1 {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
@keyframes twinkle2 {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.15; }
}
@keyframes twinkle3 {
  0%, 100% { opacity: 0.2; }
  33% { opacity: 0.8; }
  66% { opacity: 0.4; }
}
@keyframes drift {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
@media (prefers-reduced-motion: reduce) {
  .twinkle-star { animation: none !important; }
  .drift-moon { animation: none !important; }
}
`;

interface Star {
  cx: number;
  cy: number;
  r: number;
  animation: string;
  delay: string;
  dur: string;
}

function generateStars(count: number, seed: number): Star[] {
  const stars: Star[] = [];
  // Deterministic pseudo-random for consistent rendering
  let s = seed;
  const rand = () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
  const animations = ['twinkle1', 'twinkle2', 'twinkle3'];
  for (let i = 0; i < count; i++) {
    stars.push({
      cx: rand() * 1200,
      cy: rand() * 600,
      r: 1 + rand() * 2.5,
      animation: animations[Math.floor(rand() * 3)],
      delay: `${(rand() * 5).toFixed(1)}s`,
      dur: `${2 + rand() * 4}s`,
    });
  }
  return stars;
}

export function BedtimeStarsBg({ className = '', children, reduced }: BgProps) {
  const starCount = reduced ? 20 : 60;
  const stars = generateStars(starCount, 42);

  return (
    <div
      className={className}
      style={{
        ...wrapperStyle,
        background: 'linear-gradient(180deg, #0F0C29 0%, #1a1a2e 30%, #302B63 70%, #24243E 100%)',
      }}
    >
      <style>{twinkleKeyframes}</style>

      <svg style={svgLayerStyle} viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        {/* Moon */}
        <circle cx="950" cy="120" r="50" fill="#F5E6CA" opacity="0.9" />
        <circle cx="935" cy="110" r="46" fill="#0F0C29" opacity="0.85" />
        {/* Moon glow */}
        <circle cx="950" cy="120" r="80" fill="#F5E6CA" opacity="0.06">
          {!reduced && (
            <animate attributeName="r" values="75;85;75" dur="8s" repeatCount="indefinite" />
          )}
        </circle>

        {/* Stars */}
        {stars.map((star, i) => (
          <circle
            key={i}
            className="twinkle-star"
            cx={star.cx}
            cy={star.cy}
            r={star.r}
            fill="#FFFFFF"
            opacity="0.6"
            style={
              reduced
                ? undefined
                : {
                    animation: `${star.animation} ${star.dur} ease-in-out ${star.delay} infinite`,
                  }
            }
          />
        ))}

        {/* Larger accent stars (4-pointed) */}
        {!reduced && (
          <>
            {[
              { x: 200, y: 100, s: 6 },
              { x: 600, y: 60, s: 5 },
              { x: 400, y: 200, s: 4 },
              { x: 1050, y: 300, s: 5 },
              { x: 150, y: 400, s: 4 },
            ].map(({ x, y, s }, i) => (
              <g key={`accent-${i}`} className="twinkle-star" style={{
                animation: `twinkle1 ${3 + i}s ease-in-out ${i * 0.7}s infinite`,
              }}>
                <line
                  x1={x - s} y1={y} x2={x + s} y2={y}
                  stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"
                />
                <line
                  x1={x} y1={y - s} x2={x} y2={y + s}
                  stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"
                />
              </g>
            ))}
          </>
        )}

        {/* Soft horizon glow */}
        <defs>
          <radialGradient id="horizonGlow" cx="50%" cy="100%" r="60%">
            <stop offset="0%" stopColor="#302B63" stopOpacity="0.3" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="0" y="500" width="1200" height="300" fill="url(#horizonGlow)" />

        {/* Gentle rolling hills silhouette */}
        <path
          d="M0,750 Q200,680 400,720 Q600,760 800,700 Q1000,640 1200,710 L1200,800 L0,800 Z"
          fill="#16213e"
          opacity="0.6"
        />
        <path
          d="M0,770 Q300,720 500,750 Q700,780 900,730 Q1100,680 1200,740 L1200,800 L0,800 Z"
          fill="#1a1a2e"
          opacity="0.8"
        />
      </svg>

      <div style={contentStyle}>{children}</div>
    </div>
  );
}

// ── 4. Nature Meadow Background ─────────────────────────────────
// Green hills, gentle flowers, soft blue sky.

export function NatureMeadowBg({ className = '', children, reduced }: BgProps) {
  return (
    <div
      className={className}
      style={{
        ...wrapperStyle,
        background: 'linear-gradient(180deg, #87CEEB 0%, #B8E6FF 35%, #D4F1D4 60%, #A8D5A2 100%)',
      }}
    >
      <svg style={svgLayerStyle} viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        {/* Sun */}
        <circle cx="1000" cy="100" r="55" fill="#FFE66D" opacity="0.7" />
        <circle cx="1000" cy="100" r="75" fill="#FFE66D" opacity="0.15" />

        {/* Clouds */}
        <ellipse cx="300" cy="100" rx="100" ry="35" fill="#FFFFFF" opacity="0.6">
          {!reduced && (
            <animateTransform
              attributeName="transform" type="translate"
              values="0,0;15,0;0,0" dur="20s" repeatCount="indefinite"
            />
          )}
        </ellipse>
        <ellipse cx="700" cy="70" rx="80" ry="30" fill="#FFFFFF" opacity="0.5" />

        {/* Distant hills */}
        <path
          d="M0,500 Q150,420 300,460 Q500,380 700,440 Q900,380 1050,420 Q1150,450 1200,430 L1200,800 L0,800 Z"
          fill="#7EC87E"
          opacity="0.35"
        />

        {/* Middle hills */}
        <path
          d="M0,560 Q200,480 350,520 Q550,460 700,510 Q850,470 1000,500 Q1100,530 1200,490 L1200,800 L0,800 Z"
          fill="#6BCB77"
          opacity="0.4"
        />

        {/* Foreground hill */}
        <path
          d="M0,620 Q300,550 500,590 Q700,560 900,600 Q1050,580 1200,610 L1200,800 L0,800 Z"
          fill="#5AB85A"
          opacity="0.45"
        />

        {/* Grass texture on foreground */}
        <path
          d="M0,660 Q100,640 200,660 Q300,645 400,665 Q500,648 600,658 Q700,642 800,662 Q900,650 1000,660 Q1100,645 1200,655 L1200,800 L0,800 Z"
          fill="#4CAF50"
          opacity="0.3"
        />

        {!reduced && (
          <>
            {/* Flowers */}
            {[
              { x: 150, y: 640, c: '#FF6B6B', s: 8 },
              { x: 320, y: 610, c: '#FFE66D', s: 7 },
              { x: 480, y: 625, c: '#FD79A8', s: 9 },
              { x: 650, y: 600, c: '#A78BFA', s: 7 },
              { x: 800, y: 630, c: '#FF8C42', s: 8 },
              { x: 950, y: 615, c: '#FF6B6B', s: 6 },
              { x: 1080, y: 635, c: '#FFE66D', s: 7 },
              { x: 100, y: 670, c: '#FD79A8', s: 6 },
              { x: 550, y: 660, c: '#4ECDC4', s: 7 },
              { x: 880, y: 655, c: '#A78BFA', s: 8 },
            ].map(({ x, y, c, s }, i) => (
              <g key={`flower-${i}`}>
                {/* Stem */}
                <line x1={x} y1={y} x2={x} y2={y + 20} stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                {/* Petals */}
                {[0, 72, 144, 216, 288].map((angle, j) => {
                  const rad = (angle * Math.PI) / 180;
                  return (
                    <circle
                      key={j}
                      cx={x + Math.cos(rad) * s * 0.5}
                      cy={y + Math.sin(rad) * s * 0.5}
                      r={s * 0.4}
                      fill={c}
                      opacity="0.5"
                    />
                  );
                })}
                {/* Center */}
                <circle cx={x} cy={y} r={s * 0.25} fill="#FFD93D" opacity="0.6" />
              </g>
            ))}

            {/* Butterflies */}
            {[
              { x: 250, y: 450 },
              { x: 750, y: 500 },
            ].map(({ x, y }, i) => (
              <g key={`butterfly-${i}`} opacity="0.3">
                <animateTransform
                  attributeName="transform" type="translate"
                  values={`0,0; ${10 + i * 5},${-5 - i * 3}; 0,0`}
                  dur={`${6 + i * 2}s`}
                  repeatCount="indefinite"
                />
                <ellipse cx={x - 6} cy={y} rx="6" ry="4" fill="#FD79A8" />
                <ellipse cx={x + 6} cy={y} rx="6" ry="4" fill="#FD79A8" />
                <ellipse cx={x} cy={y} rx="1.5" ry="5" fill="#333" />
              </g>
            ))}

            {/* Tree silhouette - left */}
            <g opacity="0.12">
              <rect x="50" y="480" width="20" height="140" rx="6" fill="#5D4037" />
              <circle cx="60" cy="440" r="60" fill="#388E3C" />
              <circle cx="30" cy="460" r="40" fill="#43A047" />
              <circle cx="90" cy="455" r="45" fill="#2E7D32" />
            </g>
          </>
        )}
      </svg>

      <div style={contentStyle}>{children}</div>
    </div>
  );
}

// ── 5. Music Stage Background ───────────────────────────────────
// Performance stage with spotlights and musical note accents.

export function MusicStageBg({ className = '', children, reduced }: BgProps) {
  return (
    <div
      className={className}
      style={{
        ...wrapperStyle,
        background: 'linear-gradient(180deg, #1A1A2E 0%, #2D1B4E 40%, #3D2066 70%, #4A2578 100%)',
      }}
    >
      <svg style={svgLayerStyle} viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        {/* Stage floor */}
        <rect x="50" y="550" width="1100" height="250" rx="8" fill="#8B5E3C" opacity="0.3" />
        <rect x="50" y="550" width="1100" height="8" rx="4" fill="#A97C50" opacity="0.4" />
        {/* Stage floor planks */}
        {[150, 350, 550, 750, 950].map((x) => (
          <line key={x} x1={x} y1="558" x2={x} y2="800" stroke="#A97C50" strokeWidth="1" opacity="0.15" />
        ))}

        {/* Curtain sides */}
        <path d="M0,0 L0,800 L120,800 Q80,400 120,0 Z" fill="#8B1A1A" opacity="0.2" />
        <path d="M1200,0 L1200,800 L1080,800 Q1120,400 1080,0 Z" fill="#8B1A1A" opacity="0.2" />
        {/* Curtain drape - top */}
        <path d="M0,0 Q300,60 600,50 Q900,40 1200,0 L1200,80 Q900,100 600,90 Q300,100 0,80 Z" fill="#8B1A1A" opacity="0.25" />

        {/* Spotlight beams */}
        <defs>
          <linearGradient id="spotlight1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFE66D" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FFE66D" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="spotlight2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#74B9FF" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#74B9FF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="spotlight3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FD79A8" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#FD79A8" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Center spotlight */}
        <polygon points="600,0 450,550 750,550" fill="url(#spotlight1)" opacity="0.6">
          {!reduced && (
            <animate attributeName="opacity" values="0.5;0.7;0.5" dur="4s" repeatCount="indefinite" />
          )}
        </polygon>
        {/* Left spotlight */}
        <polygon points="200,0 100,550 400,550" fill="url(#spotlight2)" opacity="0.4">
          {!reduced && (
            <animate attributeName="opacity" values="0.3;0.5;0.3" dur="5s" repeatCount="indefinite" />
          )}
        </polygon>
        {/* Right spotlight */}
        <polygon points="1000,0 800,550 1100,550" fill="url(#spotlight3)" opacity="0.4">
          {!reduced && (
            <animate attributeName="opacity" values="0.35;0.55;0.35" dur="4.5s" repeatCount="indefinite" />
          )}
        </polygon>

        {/* Spotlight sources at top */}
        <circle cx="200" cy="10" r="12" fill="#FFFFFF" opacity="0.3" />
        <circle cx="600" cy="10" r="14" fill="#FFFFFF" opacity="0.4" />
        <circle cx="1000" cy="10" r="12" fill="#FFFFFF" opacity="0.3" />

        {!reduced && (
          <>
            {/* Musical notes floating */}
            {[
              { x: 150, y: 300, size: 1, delay: 0 },
              { x: 350, y: 200, size: 0.8, delay: 1.5 },
              { x: 850, y: 250, size: 1.1, delay: 0.8 },
              { x: 1050, y: 350, size: 0.9, delay: 2 },
              { x: 500, y: 400, size: 0.7, delay: 3 },
              { x: 700, y: 180, size: 1, delay: 1 },
            ].map(({ x, y, size, delay }, i) => (
              <g key={`note-${i}`} transform={`translate(${x},${y}) scale(${size})`} opacity="0.2">
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values={`${x},${y}; ${x + 5},${y - 15}; ${x},${y}`}
                  dur={`${4 + delay}s`}
                  repeatCount="indefinite"
                />
                {/* Eighth note */}
                <ellipse cx="0" cy="12" rx="7" ry="5" fill="#FFFFFF" transform="rotate(-20)" />
                <line x1="6" y1="8" x2="6" y2="-15" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                <path d="M6,-15 Q15,-12 10,-5" stroke="#FFFFFF" strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>
            ))}

            {/* Star sparkles on stage */}
            {[
              { x: 500, y: 520, s: 4 },
              { x: 700, y: 530, s: 3 },
              { x: 600, y: 540, s: 5 },
            ].map(({ x, y, s }, i) => (
              <g key={`sparkle-${i}`}>
                <line x1={x - s} y1={y} x2={x + s} y2={y} stroke="#FFE66D" strokeWidth="1" strokeLinecap="round" opacity="0.4">
                  <animate attributeName="opacity" values="0.2;0.5;0.2" dur={`${2 + i}s`} repeatCount="indefinite" />
                </line>
                <line x1={x} y1={y - s} x2={x} y2={y + s} stroke="#FFE66D" strokeWidth="1" strokeLinecap="round" opacity="0.4">
                  <animate attributeName="opacity" values="0.2;0.5;0.2" dur={`${2 + i}s`} begin={`${0.5 + i * 0.3}s`} repeatCount="indefinite" />
                </line>
              </g>
            ))}
          </>
        )}
      </svg>

      <div style={contentStyle}>{children}</div>
    </div>
  );
}

// ── 6. Storybook Cloud Background ───────────────────────────────
// Dreamy cloud world with soft pastels and gentle floating shapes.

export function StorybookCloudBg({ className = '', children, reduced }: BgProps) {
  return (
    <div
      className={className}
      style={{
        ...wrapperStyle,
        background: 'linear-gradient(180deg, #FDE8EF 0%, #E8D5F5 30%, #D5E8F5 55%, #E8F5E8 80%, #FFFBEB 100%)',
      }}
    >
      <svg style={svgLayerStyle} viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="sb-cloud-white" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sb-cloud-pink" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FD79A8" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FD79A8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="sb-cloud-lavender" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sb-rainbow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#FF6B6B" stopOpacity="0.12" />
            <stop offset="20%" stopColor="#FF8C42" stopOpacity="0.12" />
            <stop offset="40%" stopColor="#FFE66D" stopOpacity="0.12" />
            <stop offset="60%" stopColor="#6BCB77" stopOpacity="0.12" />
            <stop offset="80%" stopColor="#74B9FF" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        {/* Rainbow arc */}
        {!reduced && (
          <path
            d="M200,450 Q600,100 1000,450"
            fill="none"
            stroke="url(#sb-rainbow)"
            strokeWidth="40"
            strokeLinecap="round"
            opacity="0.7"
          />
        )}

        {/* Large cloud platforms */}
        <ellipse cx="200" cy="300" rx="200" ry="70" fill="url(#sb-cloud-white)">
          {!reduced && (
            <animateTransform
              attributeName="transform" type="translate"
              values="0,0; 10,5; 0,0" dur="18s" repeatCount="indefinite"
            />
          )}
        </ellipse>
        <ellipse cx="280" cy="280" rx="130" ry="55" fill="url(#sb-cloud-white)" />

        <ellipse cx="900" cy="250" rx="180" ry="65" fill="url(#sb-cloud-white)">
          {!reduced && (
            <animateTransform
              attributeName="transform" type="translate"
              values="0,0; -8,3; 0,0" dur="22s" repeatCount="indefinite"
            />
          )}
        </ellipse>
        <ellipse cx="960" cy="235" rx="120" ry="50" fill="url(#sb-cloud-white)" />

        {/* Mid-layer clouds */}
        <ellipse cx="550" cy="180" rx="150" ry="55" fill="url(#sb-cloud-white)">
          {!reduced && (
            <animateTransform
              attributeName="transform" type="translate"
              values="0,0; 12,0; 0,0" dur="25s" repeatCount="indefinite"
            />
          )}
        </ellipse>

        {/* Lower clouds */}
        <ellipse cx="400" cy="550" rx="250" ry="80" fill="url(#sb-cloud-white)" />
        <ellipse cx="500" cy="530" rx="160" ry="60" fill="url(#sb-cloud-white)" />

        <ellipse cx="1000" cy="580" rx="200" ry="70" fill="url(#sb-cloud-white)" />

        {/* Tinted accent clouds */}
        <ellipse cx="100" cy="500" rx="130" ry="50" fill="url(#sb-cloud-pink)">
          {!reduced && (
            <animateTransform
              attributeName="transform" type="translate"
              values="0,0; 5,2; 0,0" dur="15s" repeatCount="indefinite"
            />
          )}
        </ellipse>
        <ellipse cx="750" cy="450" rx="110" ry="45" fill="url(#sb-cloud-lavender)">
          {!reduced && (
            <animateTransform
              attributeName="transform" type="translate"
              values="0,0; -6,3; 0,0" dur="17s" repeatCount="indefinite"
            />
          )}
        </ellipse>

        {!reduced && (
          <>
            {/* Sparkle stars scattered in the dreamy sky */}
            {[
              { x: 180, y: 120, s: 5 },
              { x: 450, y: 80, s: 4 },
              { x: 680, y: 140, s: 6 },
              { x: 1050, y: 100, s: 4 },
              { x: 350, y: 400, s: 3 },
              { x: 850, y: 350, s: 5 },
            ].map(({ x, y, s }, i) => (
              <g key={`star-${i}`} opacity="0.25">
                <animate attributeName="opacity" values="0.15;0.35;0.15" dur={`${3 + i * 0.5}s`} repeatCount="indefinite" />
                <line x1={x - s} y1={y} x2={x + s} y2={y} stroke="#FFD93D" strokeWidth="1.5" strokeLinecap="round" />
                <line x1={x} y1={y - s} x2={x} y2={y + s} stroke="#FFD93D" strokeWidth="1.5" strokeLinecap="round" />
              </g>
            ))}

            {/* Gentle floating hearts */}
            {[
              { x: 300, y: 150, c: '#FD79A8' },
              { x: 900, y: 180, c: '#FF6B6B' },
            ].map(({ x, y, c }, i) => (
              <g key={`heart-${i}`} opacity="0.15">
                <animateTransform
                  attributeName="transform" type="translate"
                  values={`0,0; ${3 + i * 2},${-5 - i * 2}; 0,0`}
                  dur={`${7 + i * 3}s`}
                  repeatCount="indefinite"
                />
                <path
                  d={`M${x},${y + 4} C${x - 6},${y - 4} ${x - 10},${y + 4} ${x},${y + 12} C${x + 10},${y + 4} ${x + 6},${y - 4} ${x},${y + 4} Z`}
                  fill={c}
                />
              </g>
            ))}
          </>
        )}
      </svg>

      <div style={contentStyle}>{children}</div>
    </div>
  );
}
