// ── AmbienceLayer Component ───────────────────────────────────────────────
// Renders the visual ambience for a scene: background gradient and
// drifting/twinkling SVG particles using pure CSS animations.
//
// Performance strategy:
// - Max 20 particles (hard cap)
// - Particles positioned once with useMemo, then animated by CSS only
// - CSS `will-change: transform` + `translateZ(0)` for GPU compositing
// - No JS-driven requestAnimationFrame loops for particle movement
// - Respects prefers-reduced-motion: shows static particles, no animation
// - Particles use SVG paths -- no images, no external assets

import { useMemo, type CSSProperties, type ReactNode } from 'react';
import { useApp } from '../context/AppContext';
import {
  getScene,
  getAdjustedParticleCount,
  getAdjustedOpacity,
  type ParticleType,
} from './ambienceScenes';

// ── Props ─────────────────────────────────────────────────────────────────

interface AmbienceLayerProps {
  /** Scene ID from ambienceScenes registry. */
  sceneId: string;
  /** Visual intensity. Default: 'subtle'. */
  intensity?: 'subtle' | 'normal' | 'vivid';
  /** Whether ambient audio should play (managed externally). */
  audioEnabled?: boolean;
  /** Additional className for the wrapper. */
  className?: string;
  /** Child content rendered on top of the ambience. */
  children?: ReactNode;
}

// ── Particle SVG Paths ────────────────────────────────────────────────────
// Each particle type has an SVG path defined at a base viewBox of 24x24.

function getParticleSvg(type: ParticleType, size: number, color: string): string {
  const paths: Record<ParticleType, string> = {
    clouds:
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size * 0.6}" viewBox="0 0 60 36">` +
      `<ellipse cx="30" cy="22" rx="26" ry="12" fill="${color}" opacity="0.7"/>` +
      `<ellipse cx="20" cy="16" rx="14" ry="10" fill="${color}" opacity="0.8"/>` +
      `<ellipse cx="38" cy="14" rx="16" ry="12" fill="${color}" opacity="0.8"/>` +
      `<ellipse cx="28" cy="10" rx="12" ry="9" fill="${color}"/>` +
      `</svg>`,
    stars:
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">` +
      `<circle cx="12" cy="12" r="3" fill="${color}"/>` +
      `<line x1="12" y1="2" x2="12" y2="6" stroke="${color}" stroke-width="1" stroke-linecap="round" opacity="0.6"/>` +
      `<line x1="12" y1="18" x2="12" y2="22" stroke="${color}" stroke-width="1" stroke-linecap="round" opacity="0.6"/>` +
      `<line x1="2" y1="12" x2="6" y2="12" stroke="${color}" stroke-width="1" stroke-linecap="round" opacity="0.6"/>` +
      `<line x1="18" y1="12" x2="22" y2="12" stroke="${color}" stroke-width="1" stroke-linecap="round" opacity="0.6"/>` +
      `</svg>`,
    notes:
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">` +
      `<ellipse cx="8" cy="18" rx="4" ry="3" fill="${color}"/>` +
      `<line x1="12" y1="4" x2="12" y2="18" stroke="${color}" stroke-width="2" stroke-linecap="round"/>` +
      `<path d="M12 4 Q18 6 16 10 Q14 8 12 8" fill="${color}" opacity="0.7"/>` +
      `</svg>`,
    leaves:
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">` +
      `<path d="M12 2 C6 6 4 14 12 22 C20 14 18 6 12 2Z" fill="${color}" opacity="0.8"/>` +
      `<line x1="12" y1="6" x2="12" y2="20" stroke="${color}" stroke-width="0.8" opacity="0.5"/>` +
      `</svg>`,
    bubbles:
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">` +
      `<circle cx="12" cy="12" r="10" fill="none" stroke="${color}" stroke-width="1.5"/>` +
      `<ellipse cx="9" cy="8" rx="3" ry="2" fill="${color}" opacity="0.3" transform="rotate(-30 9 8)"/>` +
      `</svg>`,
    snowflakes:
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">` +
      `<line x1="12" y1="2" x2="12" y2="22" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>` +
      `<line x1="2" y1="12" x2="22" y2="12" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/>` +
      `<line x1="5" y1="5" x2="19" y2="19" stroke="${color}" stroke-width="1" stroke-linecap="round"/>` +
      `<line x1="19" y1="5" x2="5" y2="19" stroke="${color}" stroke-width="1" stroke-linecap="round"/>` +
      `</svg>`,
  };
  return paths[type] ?? paths.stars;
}

// ── Particle Color by Type ────────────────────────────────────────────────

function getParticleColor(type: ParticleType, sceneId: string): string {
  if (sceneId === 'bedtime') return '#C4B5FD'; // soft lavender
  switch (type) {
    case 'clouds': return '#FFFFFF';
    case 'stars': return '#FFE66D';
    case 'notes': return '#A78BFA';
    case 'leaves': return '#6BCB77';
    case 'bubbles': return '#74B9FF';
    case 'snowflakes': return '#E0E7FF';
    default: return '#FFFFFF';
  }
}

// ── Seeded Random (deterministic layout) ──────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ── CSS Keyframes (injected once) ─────────────────────────────────────────

let stylesInjected = false;

function injectKeyframes(): void {
  if (stylesInjected || typeof document === 'undefined') return;
  stylesInjected = true;

  const css = `
    @keyframes ambience-drift {
      0% { transform: translate(var(--ax, 0px), var(--ay, 0px)) translateZ(0); }
      50% { transform: translate(calc(var(--ax, 0px) + var(--dx, 20px)), calc(var(--ay, 0px) + var(--dy, -10px))) translateZ(0); }
      100% { transform: translate(var(--ax, 0px), var(--ay, 0px)) translateZ(0); }
    }
    @keyframes ambience-twinkle {
      0%, 100% { opacity: var(--base-opacity, 0.1); transform: scale(1) translateZ(0); }
      50% { opacity: calc(var(--base-opacity, 0.1) * 2.5); transform: scale(1.3) translateZ(0); }
    }
    @keyframes ambience-sway {
      0%, 100% { transform: translate(var(--ax, 0px), var(--ay, 0px)) rotate(0deg) translateZ(0); }
      25% { transform: translate(calc(var(--ax, 0px) + var(--dx, 10px)), calc(var(--ay, 0px) + var(--dy, 5px))) rotate(15deg) translateZ(0); }
      50% { transform: translate(calc(var(--ax, 0px) + var(--dx, 10px) * 2), calc(var(--ay, 0px) + var(--dy, 5px) * 2)) rotate(-5deg) translateZ(0); }
      75% { transform: translate(calc(var(--ax, 0px) + var(--dx, 10px)), calc(var(--ay, 0px) + var(--dy, 5px) * 3)) rotate(10deg) translateZ(0); }
    }
    @keyframes ambience-float {
      0% { transform: translate(var(--ax, 0px), var(--ay, 0px)) translateZ(0); }
      33% { transform: translate(calc(var(--ax, 0px) + 8px), calc(var(--ay, 0px) + var(--dy, -30px))) translateZ(0); }
      66% { transform: translate(calc(var(--ax, 0px) - 5px), calc(var(--ay, 0px) + var(--dy, -30px) * 2)) translateZ(0); }
      100% { transform: translate(var(--ax, 0px), calc(var(--ay, 0px) + var(--dy, -30px) * 3)) translateZ(0); }
    }
    @media (prefers-reduced-motion: reduce) {
      .ambience-particle {
        animation: none !important;
      }
    }
    .reduced-motion .ambience-particle {
      animation: none !important;
    }
  `;

  const style = document.createElement('style');
  style.setAttribute('data-ambience', 'true');
  style.textContent = css;
  document.head.appendChild(style);
}

// ── Animation Name Map ────────────────────────────────────────────────────

const ANIMATION_MAP: Record<string, string> = {
  drift: 'ambience-drift',
  twinkle: 'ambience-twinkle',
  sway: 'ambience-sway',
  float: 'ambience-float',
  none: 'none',
};

// ── Particle Data Generation ──────────────────────────────────────────────

interface ParticleData {
  key: string;
  x: number;    // % position
  y: number;    // % position
  size: number;  // px
  opacity: number;
  delay: number; // animation-delay in seconds
  duration: number; // animation-duration in seconds
  driftX: number; // px for CSS custom prop
  driftY: number; // px for CSS custom prop
  svgMarkup: string;
}

function generateParticles(
  sceneId: string,
  particleType: ParticleType | undefined,
  count: number,
  sizeRange: { min: number; max: number },
  baseOpacity: number,
  drift: { x: number; y: number },
  animationSpeed: number,
): ParticleData[] {
  if (!particleType || count === 0) return [];

  const rand = seededRandom(sceneId.length * 73 + 42);
  const color = getParticleColor(particleType, sceneId);
  const particles: ParticleData[] = [];

  for (let i = 0; i < count; i++) {
    const size = sizeRange.min + rand() * (sizeRange.max - sizeRange.min);
    const opacityVariation = 0.6 + rand() * 0.8; // 60%-140% of base
    const speedVariation = 0.7 + rand() * 0.6; // 70%-130% of base speed

    particles.push({
      key: `${sceneId}-p-${i}`,
      x: rand() * 100,
      y: rand() * 100,
      size: Math.round(size),
      opacity: baseOpacity * opacityVariation,
      delay: rand() * 8, // stagger start within 8 seconds
      duration: (15 + rand() * 25) / (animationSpeed * speedVariation), // 15-40s base
      driftX: drift.x * (0.5 + rand()),
      driftY: drift.y * (0.5 + rand()),
      svgMarkup: getParticleSvg(particleType, Math.round(size), color),
    });
  }

  return particles;
}

// ── Component ─────────────────────────────────────────────────────────────

export default function AmbienceLayer({
  sceneId,
  intensity = 'subtle',
  className = '',
  children,
}: AmbienceLayerProps) {
  const { bedtimeMode } = useApp();

  // Auto-select bedtime scene when bedtime mode is active
  const effectiveSceneId = bedtimeMode ? 'bedtime' : sceneId;
  const scene = getScene(effectiveSceneId);

  // Inject CSS keyframes once
  injectKeyframes();

  // Get the particle animation type from the scene layers
  const particleLayer = scene.layers.find((l) => l.type === 'particles');
  const animationType = particleLayer?.animation ?? 'none';
  const animationSpeed = particleLayer?.animationSpeed ?? 1;

  // Generate particles deterministically
  const particleCount = getAdjustedParticleCount(scene, intensity);
  const adjustedOpacity = getAdjustedOpacity(scene.particleOpacity, intensity);

  const particles = useMemo(
    () =>
      generateParticles(
        effectiveSceneId,
        scene.particleType,
        particleCount,
        scene.particleSizeRange,
        adjustedOpacity,
        scene.particleDrift,
        animationSpeed,
      ),
    [effectiveSceneId, scene, particleCount, adjustedOpacity, animationSpeed],
  );

  // Container style
  const containerStyle: CSSProperties = {
    position: 'relative',
    minHeight: '100dvh',
    overflow: 'hidden',
  };

  // Background gradient style
  const gradientStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: scene.backgroundGradient,
    zIndex: 0,
  };

  // Grid pattern overlay for classroom scene
  const showPattern = scene.layers.some((l) => l.type === 'pattern');
  const patternLayer = scene.layers.find((l) => l.type === 'pattern');
  const patternStyle: CSSProperties | undefined = showPattern
    ? {
        position: 'absolute',
        inset: 0,
        zIndex: patternLayer?.zIndex ?? 1,
        opacity: patternLayer?.opacity ?? 0.03,
        backgroundImage:
          'linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px), ' +
          'linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        pointerEvents: 'none' as const,
      }
    : undefined;

  // Content overlay (children go here, above ambience)
  const contentStyle: CSSProperties = {
    position: 'relative',
    zIndex: 10,
    minHeight: '100dvh',
  };

  const animationName = ANIMATION_MAP[animationType] ?? 'none';

  return (
    <div className={`ambience-container ${className}`} style={containerStyle}>
      {/* Background gradient */}
      <div style={gradientStyle} aria-hidden="true" />

      {/* Optional grid pattern */}
      {patternStyle && <div style={patternStyle} aria-hidden="true" />}

      {/* Particles */}
      {particles.length > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: particleLayer?.zIndex ?? 1,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
          aria-hidden="true"
        >
          {particles.map((p) => {
            const particleStyle: CSSProperties = {
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              willChange: 'transform, opacity',
              animationName: animationName !== 'none' ? animationName : undefined,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              animationFillMode: 'both',
              // CSS custom properties for keyframe calculations
              ['--ax' as string]: '0px',
              ['--ay' as string]: '0px',
              ['--dx' as string]: `${p.driftX}px`,
              ['--dy' as string]: `${p.driftY}px`,
              ['--base-opacity' as string]: `${p.opacity}`,
              pointerEvents: 'none',
            };

            return (
              <div
                key={p.key}
                className="ambience-particle"
                style={particleStyle}
                dangerouslySetInnerHTML={{ __html: p.svgMarkup }}
              />
            );
          })}
        </div>
      )}

      {/* Content layer */}
      <div style={contentStyle}>{children}</div>
    </div>
  );
}
