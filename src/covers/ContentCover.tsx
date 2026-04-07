// ── Content Cover Card Component ─────────────────────────────────
// Reusable cover art card for stories, lessons, games, videos,
// songs, and activities. Renders gradient backgrounds, emoji focal
// points, type-specific accents, and optional metadata pills.

import { motion } from 'framer-motion';
import type { CSSProperties } from 'react';
import { coverPalettes, getPaletteGradient, defaultTypePalette } from './coverPalettes';
import { coverSizes, typeAccents, aspectRatios } from './coverArtSystem';
import type { CoverPaletteName } from './coverPalettes';
import type { CoverSize, AspectRatioName, ContentType } from './coverArtSystem';

// ── Props ───────────────────────────────────────────────────────

interface ContentCoverProps {
  type: ContentType;
  title: string;
  emoji: string;
  palette?: CoverPaletteName;
  ageLabel?: string;
  duration?: string;
  badges?: Array<{ label: string; color: string }>;
  aspectRatio?: AspectRatioName;
  size?: CoverSize;
  mascotId?: string;
  className?: string;
}

// ── Mascot Emoji Map ────────────────────────────────────────────

const mascotEmojis: Record<string, string> = {
  leo: '\u{1F981}',
  daisy: '\u{1F986}',
  ollie: '\u{1F989}',
  ruby: '\u{1F430}',
  finn: '\u{1F98A}',
};

// ── Component ───────────────────────────────────────────────────

export default function ContentCover({
  type,
  title,
  emoji,
  palette,
  ageLabel,
  duration,
  badges,
  aspectRatio = '4:3',
  size = 'md',
  mascotId,
  className = '',
}: ContentCoverProps) {
  // Resolve palette
  const paletteName: CoverPaletteName = palette ?? defaultTypePalette[type] ?? 'default';
  const pal = coverPalettes[paletteName];
  const sizeSpec = coverSizes[size];
  const arSpec = aspectRatios[aspectRatio];

  // Type-specific accent CSS
  const accentCss = typeAccents[type].css(pal.accentColor);

  // Container style
  const containerStyle: CSSProperties = {
    background: getPaletteGradient(paletteName),
    borderRadius: sizeSpec.borderRadius,
    aspectRatio: arSpec.cssAspect,
    padding: sizeSpec.innerPadding,
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: type === 'story' ? 'flex-start' : 'center',
    justifyContent: 'center',
    ...accentCss,
  };

  return (
    <motion.div
      className={`cursor-pointer select-none ${className}`}
      style={containerStyle}
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
    >
      {/* ── Type-specific background decorations ──────────────── */}
      <TypeDecoration type={type} accentColor={pal.accentColor} />

      {/* ── Badges (top-right) ───────────────────────────────── */}
      {badges && badges.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: sizeSpec.innerPadding * 0.75,
            right: sizeSpec.innerPadding * 0.75,
            display: 'flex',
            gap: 4,
            zIndex: 5,
          }}
        >
          {badges.slice(0, 2).map((badge, i) => (
            <span
              key={i}
              style={{
                fontSize: sizeSpec.badgeSize,
                fontWeight: 700,
                background: badge.color + '30',
                color: pal.textColor,
                borderRadius: 9999,
                padding: sizeSpec.pillPadding,
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}
            >
              {badge.label}
            </span>
          ))}
        </div>
      )}

      {/* ── Focal Emoji ──────────────────────────────────────── */}
      <motion.div
        style={{
          fontSize: sizeSpec.emojiFontSize,
          lineHeight: 1,
          textAlign: 'center',
          zIndex: 2,
          flex: '1 1 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.05 }}
      >
        {emoji}
      </motion.div>

      {/* ── Title ────────────────────────────────────────────── */}
      <div
        style={{
          width: '100%',
          textAlign: type === 'story' ? 'left' : 'center',
          zIndex: 3,
          marginTop: size === 'sm' ? 4 : 8,
        }}
      >
        <p
          style={{
            fontSize: sizeSpec.titleSize,
            fontWeight: 800,
            color: pal.textColor,
            textShadow: pal.textShadow,
            lineHeight: 1.2,
            margin: 0,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {title}
        </p>
      </div>

      {/* ── Bottom row: age label, mascot, duration ─────────── */}
      {(ageLabel || duration || mascotId) && (
        <div
          style={{
            position: 'absolute',
            bottom: sizeSpec.innerPadding * 0.75,
            left: sizeSpec.innerPadding * 0.75,
            right: sizeSpec.innerPadding * 0.75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 5,
          }}
        >
          {/* Age label pill - bottom left */}
          {ageLabel ? (
            <span
              style={{
                fontSize: sizeSpec.badgeSize,
                fontWeight: 700,
                background: pal.pillBg,
                color: pal.pillText,
                borderRadius: 9999,
                padding: sizeSpec.pillPadding,
                lineHeight: 1,
              }}
            >
              {ageLabel}
            </span>
          ) : (
            <span />
          )}

          {/* Mascot avatar */}
          {mascotId && mascotEmojis[mascotId] && (
            <span
              style={{
                fontSize: size === 'sm' ? 16 : size === 'md' ? 20 : 28,
                lineHeight: 1,
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
              }}
            >
              {mascotEmojis[mascotId]}
            </span>
          )}

          {/* Duration pill - bottom right */}
          {duration ? (
            <span
              style={{
                fontSize: sizeSpec.badgeSize,
                fontWeight: 600,
                background: pal.pillBg,
                color: pal.pillText,
                borderRadius: 9999,
                padding: sizeSpec.pillPadding,
                lineHeight: 1,
              }}
            >
              {duration}
            </span>
          ) : (
            <span />
          )}
        </div>
      )}
    </motion.div>
  );
}

// ── Type-Specific Background Decoration ─────────────────────────
// Renders subtle SVG accents based on content type.

function TypeDecoration({
  type,
  accentColor,
}: {
  type: ContentType;
  accentColor: string;
}) {
  const baseStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 1,
    overflow: 'hidden',
  };

  switch (type) {
    case 'story':
      return (
        <div style={baseStyle}>
          {/* Warm page curl effect in bottom-right */}
          <svg
            style={{ position: 'absolute', bottom: 0, right: 0, width: '30%', height: '30%' }}
            viewBox="0 0 100 100"
            preserveAspectRatio="xMaxYMax meet"
          >
            <path
              d="M100,60 Q80,80 60,100 L100,100 Z"
              fill={accentColor}
              opacity="0.15"
            />
          </svg>
          {/* Faint book lines */}
          {[30, 50, 70].map((y) => (
            <div
              key={y}
              style={{
                position: 'absolute',
                left: '15%',
                right: '15%',
                top: `${y}%`,
                height: 1,
                background: accentColor,
                opacity: 0.08,
                borderRadius: 1,
              }}
            />
          ))}
        </div>
      );

    case 'lesson':
      return (
        <div style={baseStyle}>
          {/* Subtle grid dots */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            <defs>
              <pattern id="lesson-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="1" fill={accentColor} opacity="0.15" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#lesson-dots)" />
          </svg>
        </div>
      );

    case 'game':
      return (
        <div style={baseStyle}>
          {/* Radial starburst glow behind center */}
          <div
            style={{
              position: 'absolute',
              top: '15%',
              left: '15%',
              right: '15%',
              bottom: '25%',
              background: `radial-gradient(circle at 50% 45%, ${accentColor}25 0%, transparent 65%)`,
              borderRadius: '50%',
            }}
          />
          {/* Small decorative stars */}
          {[
            { x: '10%', y: '15%', s: 8 },
            { x: '85%', y: '20%', s: 6 },
            { x: '15%', y: '75%', s: 7 },
            { x: '80%', y: '70%', s: 5 },
          ].map(({ x, y, s }, i) => (
            <svg
              key={i}
              style={{ position: 'absolute', left: x, top: y, width: s * 2, height: s * 2 }}
              viewBox="0 0 20 20"
            >
              <polygon
                points="10,2 12.5,7.5 18,8.5 14,12.5 15,18 10,15 5,18 6,12.5 2,8.5 7.5,7.5"
                fill={accentColor}
                opacity="0.2"
              />
            </svg>
          ))}
        </div>
      );

    case 'video':
      return (
        <div style={baseStyle}>
          {/* Film strip perforations - top */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '4px 8px' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`t-${i}`}
                style={{
                  width: 6,
                  height: 4,
                  borderRadius: 1,
                  background: accentColor,
                  opacity: 0.2,
                }}
              />
            ))}
          </div>
          {/* Film strip perforations - bottom */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '4px 8px' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`b-${i}`}
                style={{
                  width: 6,
                  height: 4,
                  borderRadius: 1,
                  background: accentColor,
                  opacity: 0.2,
                }}
              />
            ))}
          </div>
          {/* Play button hint */}
          <svg
            style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 32, height: 32 }}
            viewBox="0 0 32 32"
          >
            <circle cx="16" cy="16" r="15" fill={accentColor} opacity="0.08" />
            <polygon points="13,10 13,22 23,16" fill={accentColor} opacity="0.12" />
          </svg>
        </div>
      );

    case 'song':
      return (
        <div style={baseStyle}>
          {/* Musical wave at bottom */}
          <svg
            style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '35%' }}
            viewBox="0 0 400 100"
            preserveAspectRatio="none"
          >
            <path
              d="M0,60 Q50,30 100,55 Q150,80 200,50 Q250,20 300,55 Q350,90 400,50 L400,100 L0,100 Z"
              fill={accentColor}
              opacity="0.1"
            />
            <path
              d="M0,70 Q50,45 100,65 Q150,85 200,60 Q250,35 300,65 Q350,95 400,60 L400,100 L0,100 Z"
              fill={accentColor}
              opacity="0.06"
            />
          </svg>
          {/* Musical note accents */}
          {[
            { x: '8%', y: '12%' },
            { x: '88%', y: '18%' },
          ].map(({ x, y }, i) => (
            <svg
              key={i}
              style={{ position: 'absolute', left: x, top: y, width: 16, height: 22 }}
              viewBox="0 0 16 22"
            >
              <ellipse cx="5" cy="18" rx="5" ry="3.5" fill={accentColor} opacity="0.2" transform="rotate(-15,5,18)" />
              <line x1="10" y1="16" x2="10" y2="2" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
              <path d="M10,2 Q14,4 12,8" stroke={accentColor} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.2" />
            </svg>
          ))}
        </div>
      );

    case 'activity':
      return (
        <div style={baseStyle}>
          {/* Dashed craft border inset */}
          <div
            style={{
              position: 'absolute',
              inset: 6,
              border: `2px dashed ${accentColor}`,
              borderRadius: 12,
              opacity: 0.15,
              pointerEvents: 'none',
            }}
          />
          {/* Scissors icon hint top-right */}
          <svg
            style={{ position: 'absolute', top: 3, right: 3, width: 14, height: 14 }}
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="6" cy="6" r="3" stroke={accentColor} strokeWidth="1.5" opacity="0.2" />
            <circle cx="6" cy="18" r="3" stroke={accentColor} strokeWidth="1.5" opacity="0.2" />
            <line x1="8.5" y1="7.5" x2="18" y2="16" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
            <line x1="8.5" y1="16.5" x2="18" y2="8" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.2" />
          </svg>
        </div>
      );

    default:
      return null;
  }
}
