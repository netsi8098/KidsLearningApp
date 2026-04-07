// ── Texture & Pattern Overlay Components ────────────────────────
// Subtle decorative SVG patterns rendered as absolute-positioned
// overlays with low opacity. All are pointer-events: none.

import type { CSSProperties } from 'react';

const overlayStyle: CSSProperties = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  overflow: 'hidden',
};

// ── Dot Pattern ─────────────────────────────────────────────────
// Small evenly-spaced dots. Great for learning sections.

interface DotPatternProps {
  /** Dot radius in px (default: 1.5) */
  size?: number;
  /** Gap between dots in px (default: 24) */
  gap?: number;
  /** Opacity 0-1 (default: 0.05) */
  opacity?: number;
  /** Dot color (default: currentColor) */
  color?: string;
  className?: string;
}

export function DotPattern({
  size = 1.5,
  gap = 24,
  opacity = 0.05,
  color = '#374151',
  className = '',
}: DotPatternProps) {
  const patternId = `dot-pattern-${size}-${gap}`;

  return (
    <svg
      className={className}
      style={{ ...overlayStyle, opacity }}
      aria-hidden="true"
    >
      <defs>
        <pattern
          id={patternId}
          x="0"
          y="0"
          width={gap}
          height={gap}
          patternUnits="userSpaceOnUse"
        >
          <circle
            cx={gap / 2}
            cy={gap / 2}
            r={size}
            fill={color}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}

// ── Wave Pattern ────────────────────────────────────────────────
// Gentle horizontal wavy lines.

interface WavePatternProps {
  /** Number of waves vertically (default: 8) */
  waveCount?: number;
  /** Wave amplitude in px (default: 6) */
  amplitude?: number;
  /** Opacity 0-1 (default: 0.04) */
  opacity?: number;
  /** Stroke color (default: #4ECDC4 -- teal) */
  color?: string;
  /** Stroke width (default: 1.5) */
  strokeWidth?: number;
  className?: string;
}

export function WavePattern({
  waveCount = 8,
  amplitude = 6,
  opacity = 0.04,
  color = '#4ECDC4',
  strokeWidth = 1.5,
  className = '',
}: WavePatternProps) {
  const viewBoxHeight = 800;
  const spacing = viewBoxHeight / (waveCount + 1);

  const wavePaths = Array.from({ length: waveCount }, (_, i) => {
    const y = spacing * (i + 1);
    // Generate a smooth sine-like wave using cubic bezier curves
    const segments = 6;
    const segWidth = 1200 / segments;
    let d = `M0,${y}`;
    for (let s = 0; s < segments; s++) {
      const x1 = s * segWidth + segWidth * 0.33;
      const y1 = y + (s % 2 === 0 ? -amplitude : amplitude);
      const x2 = s * segWidth + segWidth * 0.66;
      const y2 = y + (s % 2 === 0 ? -amplitude : amplitude);
      const x3 = (s + 1) * segWidth;
      const y3 = y;
      d += ` C${x1},${y1} ${x2},${y2} ${x3},${y3}`;
    }
    return d;
  });

  return (
    <svg
      className={className}
      style={{ ...overlayStyle, opacity }}
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {wavePaths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

// ── Starfield Pattern ───────────────────────────────────────────
// Sparse twinkling stars for bedtime mode. Uses CSS animations
// and respects prefers-reduced-motion via the .reduced-motion class.

interface StarfieldPatternProps {
  /** Number of stars (default: 30) */
  count?: number;
  /** Opacity 0-1 (default: 0.08) */
  opacity?: number;
  /** Star color (default: #FFFFFF) */
  color?: string;
  /** Max star radius (default: 2) */
  maxSize?: number;
  className?: string;
}

const starfieldKeyframes = `
@keyframes sfTwinkle {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
`;

export function StarfieldPattern({
  count = 30,
  opacity = 0.08,
  color = '#FFFFFF',
  maxSize = 2,
  className = '',
}: StarfieldPatternProps) {
  // Deterministic star positions using a simple hash
  const stars = Array.from({ length: count }, (_, i) => {
    const seed = i * 7919 + 1301;
    const x = ((seed * 13) % 1200);
    const y = ((seed * 17) % 800);
    const r = 0.5 + ((seed * 23) % 100) / 100 * (maxSize - 0.5);
    const dur = 2 + ((seed * 31) % 100) / 25; // 2-6s
    const delay = ((seed * 37) % 100) / 20; // 0-5s
    return { x, y, r, dur, delay };
  });

  return (
    <>
      <style>{starfieldKeyframes}</style>
      <svg
        className={className}
        style={{ ...overlayStyle, opacity }}
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {stars.map((star, i) => (
          <circle
            key={i}
            cx={star.x}
            cy={star.y}
            r={star.r}
            fill={color}
            style={{
              animation: `sfTwinkle ${star.dur}s ease-in-out ${star.delay}s infinite`,
            }}
          />
        ))}
      </svg>
    </>
  );
}

// ── Confetti Pattern ────────────────────────────────────────────
// Celebration confetti pieces scattered across the overlay.

interface ConfettiPatternProps {
  /** Number of confetti pieces (default: 40) */
  count?: number;
  /** Opacity 0-1 (default: 0.06) */
  opacity?: number;
  /** Custom colors (default: palette colors) */
  colors?: string[];
  className?: string;
}

const defaultConfettiColors = [
  '#FF6B6B', // coral
  '#4ECDC4', // teal
  '#FFE66D', // sunny
  '#A78BFA', // grape
  '#6BCB77', // leaf
  '#FF8C42', // tangerine
  '#FD79A8', // pink
  '#74B9FF', // sky
];

export function ConfettiPattern({
  count = 40,
  opacity = 0.06,
  colors: confettiColors = defaultConfettiColors,
  className = '',
}: ConfettiPatternProps) {
  // Deterministic confetti positions
  const pieces = Array.from({ length: count }, (_, i) => {
    const seed = i * 6271 + 997;
    const x = ((seed * 13) % 1200);
    const y = ((seed * 19) % 800);
    const width = 4 + ((seed * 23) % 8);
    const height = 2 + ((seed * 29) % 4);
    const rotation = ((seed * 37) % 360);
    const colorIndex = ((seed * 41) % confettiColors.length);
    const shape = ((seed * 43) % 3); // 0=rect, 1=circle, 2=triangle
    return { x, y, width, height, rotation, color: confettiColors[colorIndex], shape };
  });

  return (
    <svg
      className={className}
      style={{ ...overlayStyle, opacity }}
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {pieces.map((piece, i) => {
        const transform = `translate(${piece.x},${piece.y}) rotate(${piece.rotation})`;
        switch (piece.shape) {
          case 0:
            return (
              <rect
                key={i}
                width={piece.width}
                height={piece.height}
                rx={1}
                transform={transform}
                fill={piece.color}
              />
            );
          case 1:
            return (
              <circle
                key={i}
                r={piece.width / 2}
                transform={transform}
                fill={piece.color}
              />
            );
          case 2:
            return (
              <polygon
                key={i}
                points={`0,${-piece.width / 2} ${piece.width / 2},${piece.width / 2} ${-piece.width / 2},${piece.width / 2}`}
                transform={transform}
                fill={piece.color}
              />
            );
          default:
            return null;
        }
      })}
    </svg>
  );
}

// ── Grid Pattern ────────────────────────────────────────────────
// Soft grid for learning sections. Notebook/graph paper feel.

interface GridPatternProps {
  /** Cell size in px (default: 32) */
  cellSize?: number;
  /** Opacity 0-1 (default: 0.03) */
  opacity?: number;
  /** Line color (default: #74B9FF -- sky) */
  color?: string;
  /** Line weight (default: 1) */
  strokeWidth?: number;
  /** Show thicker lines every N cells (0 to disable) */
  majorEvery?: number;
  className?: string;
}

export function GridPattern({
  cellSize = 32,
  opacity = 0.03,
  color = '#74B9FF',
  strokeWidth = 1,
  majorEvery = 4,
  className = '',
}: GridPatternProps) {
  const patternId = `grid-pattern-${cellSize}`;
  const majorId = `grid-major-${cellSize}`;
  const majorSize = majorEvery > 0 ? cellSize * majorEvery : 0;

  return (
    <svg
      className={className}
      style={{ ...overlayStyle, opacity }}
      aria-hidden="true"
    >
      <defs>
        {/* Minor grid */}
        <pattern
          id={patternId}
          x="0"
          y="0"
          width={cellSize}
          height={cellSize}
          patternUnits="userSpaceOnUse"
        >
          <line
            x1="0" y1={cellSize}
            x2={cellSize} y2={cellSize}
            stroke={color}
            strokeWidth={strokeWidth}
          />
          <line
            x1={cellSize} y1="0"
            x2={cellSize} y2={cellSize}
            stroke={color}
            strokeWidth={strokeWidth}
          />
        </pattern>

        {/* Major grid */}
        {majorSize > 0 && (
          <pattern
            id={majorId}
            x="0"
            y="0"
            width={majorSize}
            height={majorSize}
            patternUnits="userSpaceOnUse"
          >
            <rect width={majorSize} height={majorSize} fill={`url(#${patternId})`} />
            <line
              x1="0" y1={majorSize}
              x2={majorSize} y2={majorSize}
              stroke={color}
              strokeWidth={strokeWidth * 2}
            />
            <line
              x1={majorSize} y1="0"
              x2={majorSize} y2={majorSize}
              stroke={color}
              strokeWidth={strokeWidth * 2}
            />
          </pattern>
        )}
      </defs>

      <rect
        width="100%"
        height="100%"
        fill={`url(#${majorSize > 0 ? majorId : patternId})`}
      />
    </svg>
  );
}
