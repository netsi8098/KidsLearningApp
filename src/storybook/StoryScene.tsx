// ─── Cinematic Story Scene Component ───────────────────────────────────────
// Renders a single story page according to a SceneTemplate layout.
// Features illustration, highlighted vocabulary text, narration button,
// interactive hotspots, and page navigation with swipe support.

import { useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import type { SceneTemplate, SceneType } from './sceneTemplates';
import { getTransitionVariants } from './sceneTemplates';
import StoryTransition, { PageCurlHint } from './StoryTransition';

// ─── Types ─────────────────────────────────────────────────────────────────

interface Hotspot {
  id: string;
  emoji: string;
  position: { x: string; y: string };
  animation: string;
}

interface StorySceneProps {
  scene: SceneTemplate;
  illustration: string; // emoji or image URL
  text: string;
  highlightWords?: string[];
  narrationEnabled?: boolean;
  onNarrate?: () => void;
  onTapHotspot?: (hotspotId: string) => void;
  hotspots?: Hotspot[];
  pageNumber: number;
  totalPages: number;
  onNext?: () => void;
  onPrevious?: () => void;
  bedtime?: boolean;
}

// ─── Ambient Motion Components ─────────────────────────────────────────────

function AmbientStarsTwinkle() {
  const stars = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        x: `${5 + Math.random() * 90}%`,
        y: `${5 + Math.random() * 90}%`,
        delay: Math.random() * 3,
        size: 0.3 + Math.random() * 0.5,
      })),
    [],
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {stars.map((star, i) => (
        <motion.span
          key={i}
          className="absolute text-white"
          style={{
            left: star.x,
            top: star.y,
            fontSize: `${star.size}rem`,
          }}
          animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: star.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          *
        </motion.span>
      ))}
    </div>
  );
}

function AmbientSparkle() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute text-xl"
          style={{
            left: `${15 + i * 13}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.2, 0.5],
            rotate: [0, 180],
          }}
          transition={{
            duration: 2.5,
            delay: i * 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          ✨
        </motion.span>
      ))}
    </div>
  );
}

function AmbientQuestionMarks() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl opacity-30"
          style={{
            left: `${10 + i * 22}%`,
            bottom: '10%',
          }}
          animate={{ y: [0, -60], opacity: [0.3, 0], rotate: [0, 20] }}
          transition={{
            duration: 3,
            delay: i * 0.8,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        >
          ❓
        </motion.span>
      ))}
    </div>
  );
}

function AmbientFloat({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

function renderAmbient(motion?: string) {
  switch (motion) {
    case 'stars-twinkle':
      return <AmbientStarsTwinkle />;
    case 'sparkle':
      return <AmbientSparkle />;
    case 'question-marks':
      return <AmbientQuestionMarks />;
    default:
      return null;
  }
}

// ─── Hotspot Component ─────────────────────────────────────────────────────

function HotspotButton({
  hotspot,
  onTap,
}: {
  hotspot: Hotspot;
  onTap: (id: string) => void;
}) {
  const [tapped, setTapped] = useState(false);

  const animationVariant = useMemo(() => {
    switch (hotspot.animation) {
      case 'bounce':
        return { y: [0, -8, 0] };
      case 'wobble':
        return { rotate: [0, -10, 10, -10, 0] };
      case 'pulse':
        return { scale: [1, 1.15, 1] };
      case 'spin':
        return { rotate: [0, 360] };
      default:
        return { scale: [1, 1.1, 1] };
    }
  }, [hotspot.animation]);

  return (
    <motion.button
      className="absolute z-20 cursor-pointer"
      style={{
        left: hotspot.position.x,
        top: hotspot.position.y,
        transform: 'translate(-50%, -50%)',
      }}
      animate={animationVariant}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      onClick={() => {
        setTapped(true);
        onTap(hotspot.id);
        setTimeout(() => setTapped(false), 600);
      }}
      whileTap={{ scale: 0.85 }}
      aria-label={`Tap ${hotspot.emoji}`}
    >
      <span className="text-4xl select-none">{hotspot.emoji}</span>
      {tapped && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0.5, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-3xl">✨</span>
        </motion.div>
      )}
    </motion.button>
  );
}

// ─── Narrate Button ────────────────────────────────────────────────────────

function NarrateButton({
  position,
  onNarrate,
  bedtime,
}: {
  position: string;
  onNarrate: () => void;
  bedtime: boolean;
}) {
  const posClasses: Record<string, string> = {
    'bottom-right': 'bottom-28 right-4',
    'bottom-center': 'bottom-28 left-1/2 -translate-x-1/2',
    'top-right': 'top-16 right-4',
  };

  return (
    <motion.button
      className={`absolute ${posClasses[position] ?? posClasses['bottom-right']} z-30
        w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl cursor-pointer`}
      style={{
        backgroundColor: bedtime ? '#4338CA' : '#FF6B6B',
      }}
      onClick={onNarrate}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={{ boxShadow: ['0 0 0 0 rgba(255,107,107,0.4)', '0 0 0 12px rgba(255,107,107,0)', '0 0 0 0 rgba(255,107,107,0)'] }}
      transition={{ duration: 2, repeat: Infinity }}
      aria-label="Read this page aloud"
    >
      🔊
    </motion.button>
  );
}

// ─── Text Renderer with Highlights ─────────────────────────────────────────

function HighlightedText({
  text,
  highlightWords,
  textStyle,
  bedtime,
}: {
  text: string;
  highlightWords: string[];
  textStyle: {
    fontSize: string;
    lineHeight: string;
    fontWeight: string;
    color: string;
  };
  bedtime: boolean;
}) {
  const highlightSet = useMemo(
    () => new Set(highlightWords.map((w) => w.toLowerCase())),
    [highlightWords],
  );
  const tokens = text.split(/(\s+)/);
  const highlightColor = bedtime ? '#C4B5FD' : '#FF6B6B';

  return (
    <motion.p
      style={{
        fontSize: textStyle.fontSize,
        lineHeight: textStyle.lineHeight,
        fontWeight: textStyle.fontWeight,
        color: textStyle.color,
      }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      {tokens.map((token, i) => {
        const clean = token.replace(/[^a-zA-Z'-]/g, '').toLowerCase();
        const isHighlight = highlightSet.has(clean);
        if (isHighlight) {
          return (
            <span
              key={i}
              className="font-extrabold"
              style={{ color: highlightColor }}
            >
              {token}
            </span>
          );
        }
        return <span key={i}>{token}</span>;
      })}
    </motion.p>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════

export default function StoryScene({
  scene,
  illustration,
  text,
  highlightWords = [],
  narrationEnabled = true,
  onNarrate,
  onTapHotspot,
  hotspots = [],
  pageNumber,
  totalPages,
  onNext,
  onPrevious,
  bedtime = false,
}: StorySceneProps) {
  const [direction, setDirection] = useState<'next' | 'previous'>('next');
  const [showCurlHint, setShowCurlHint] = useState(pageNumber === 0);
  const swipeStartRef = useRef<number | null>(null);

  // Effective styles
  const bgColor = bedtime ? '#1E1B4B' : scene.backgroundColor;
  const effectiveTextStyle = bedtime
    ? { ...scene.textStyle, color: '#E0E7FF' }
    : scene.textStyle;
  const effectiveHotspots = bedtime ? [] : hotspots;
  const effectiveMood = bedtime ? 'bedtime' : scene.mood;

  // ─── Swipe handling ──────────────────────────────────────────────────
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    swipeStartRef.current = e.touches[0].clientX;
    setShowCurlHint(false);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (swipeStartRef.current === null) return;
      const diff = swipeStartRef.current - e.changedTouches[0].clientX;
      const threshold = 50;

      if (diff > threshold && onNext) {
        setDirection('next');
        onNext();
      } else if (diff < -threshold && onPrevious) {
        setDirection('previous');
        onPrevious();
      }
      swipeStartRef.current = null;
    },
    [onNext, onPrevious],
  );

  const handleClickNext = useCallback(() => {
    setDirection('next');
    onNext?.();
  }, [onNext]);

  const handleClickPrev = useCallback(() => {
    setDirection('previous');
    onPrevious?.();
  }, [onPrevious]);

  // ─── Illustration rendering ──────────────────────────────────────────
  const isEmoji = !illustration.startsWith('http');

  const illustrationElement = (
    <motion.div
      className="flex items-center justify-center select-none"
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
    >
      {isEmoji ? (
        <span
          className="leading-none"
          style={{ fontSize: scene.layout.illustrationArea.size === '100%' ? '10rem' : '8rem' }}
        >
          {illustration}
        </span>
      ) : (
        <img
          src={illustration}
          alt="Story illustration"
          className="max-w-full max-h-full object-contain rounded-2xl"
          style={{ maxHeight: '40vh' }}
        />
      )}
    </motion.div>
  );

  const wrappedIllustration =
    scene.ambientMotion === 'gentle-float' || scene.ambientMotion === 'bounce' ? (
      <AmbientFloat>{illustrationElement}</AmbientFloat>
    ) : (
      illustrationElement
    );

  // ─── Layout rendering based on scene type ────────────────────────────
  const renderLayout = () => {
    const { illustrationArea, textArea } = scene.layout;

    // Common text block
    const textBlock = (
      <div
        className="relative z-10"
        style={{
          maxWidth: textArea.maxWidth,
          textAlign: textArea.alignment as 'left' | 'center' | 'right',
          margin: textArea.alignment === 'center' ? '0 auto' : undefined,
        }}
      >
        <HighlightedText
          text={text}
          highlightWords={highlightWords}
          textStyle={effectiveTextStyle}
          bedtime={bedtime}
        />
      </div>
    );

    switch (scene.type) {
      case 'hero-illustration':
        return (
          <div className="flex flex-col h-full">
            <div className="flex-[55] flex items-center justify-center relative">
              {wrappedIllustration}
            </div>
            <div className="flex-[45] flex items-start justify-center px-6 pt-4">
              {textBlock}
            </div>
          </div>
        );

      case 'read-aloud':
        return (
          <div className="flex flex-col h-full relative">
            <div className="absolute top-4 right-4 z-10">
              {wrappedIllustration}
            </div>
            <div className="flex-1 flex items-center px-6 pr-24">
              {textBlock}
            </div>
          </div>
        );

      case 'interactive':
        return (
          <div className="flex flex-col h-full">
            <div className="flex-[50] flex items-center justify-center relative">
              {wrappedIllustration}
              {/* Hotspots overlay */}
              {effectiveHotspots.map((hs) => (
                <HotspotButton
                  key={hs.id}
                  hotspot={hs}
                  onTap={onTapHotspot ?? (() => {})}
                />
              ))}
            </div>
            <div className="flex-[50] flex items-start justify-center px-6 pt-4">
              {textBlock}
            </div>
          </div>
        );

      case 'dialogue':
        return (
          <div className="flex flex-col h-full items-center justify-center px-6 gap-6">
            <div className="flex items-center gap-8 w-full justify-center">
              {wrappedIllustration}
            </div>
            {/* Speech bubble */}
            <motion.div
              className="bg-white/90 backdrop-blur rounded-2xl shadow-lg px-6 py-4 relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              <div
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/90 rotate-45"
              />
              {textBlock}
            </motion.div>
          </div>
        );

      case 'calm-ending':
        return (
          <div className="flex flex-col h-full items-center justify-center px-6 relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              {illustrationElement}
            </div>
            <div className="relative z-10">{textBlock}</div>
          </div>
        );

      case 'dramatic-moment':
        return (
          <div className="flex flex-col h-full relative">
            {/* Letterbox bars */}
            <div className="h-12 bg-black/80" />
            <div className="flex-1 flex items-center justify-center relative">
              {wrappedIllustration}
            </div>
            <div className="bg-black/80 px-6 py-6 flex items-center justify-center">
              {textBlock}
            </div>
            <div className="h-12 bg-black/80" />
          </div>
        );

      case 'discovery':
        return (
          <div className="flex flex-col h-full">
            <div className="flex items-start justify-center px-6 pt-6">
              {textBlock}
            </div>
            <div className="flex-1 flex items-center justify-center relative">
              {wrappedIllustration}
              {effectiveHotspots.map((hs) => (
                <HotspotButton
                  key={hs.id}
                  hotspot={hs}
                  onTap={onTapHotspot ?? (() => {})}
                />
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col h-full items-center justify-center px-6 gap-6">
            {wrappedIllustration}
            {textBlock}
          </div>
        );
    }
  };

  return (
    <div
      className="min-h-dvh relative flex flex-col overflow-hidden"
      style={{ backgroundColor: bgColor }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Ambient background motion */}
      {renderAmbient(bedtime ? 'stars-twinkle' : scene.ambientMotion)}

      {/* Page content with transition */}
      <div className="flex-1 relative">
        <StoryTransition
          direction={direction}
          pageKey={pageNumber}
          mood={effectiveMood}
        >
          {renderLayout()}
        </StoryTransition>
      </div>

      {/* Narrate button */}
      {narrationEnabled && onNarrate && (
        <NarrateButton
          position={scene.layout.narrateButton.position}
          onNarrate={onNarrate}
          bedtime={bedtime}
        />
      )}

      {/* Page curl hint */}
      <PageCurlHint visible={showCurlHint} />

      {/* ─── Bottom navigation ───────────────────────────────────── */}
      <div className="relative z-30 px-4 pb-6 pt-2">
        <div className="flex items-center justify-between">
          {/* Previous button */}
          <motion.button
            className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl cursor-pointer disabled:opacity-30"
            style={{ backgroundColor: bedtime ? '#312E81' : '#FFFFFF' }}
            onClick={handleClickPrev}
            disabled={pageNumber === 0}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Previous page"
          >
            <span style={{ color: bedtime ? '#C4B5FD' : '#374151' }}>
              ◀️
            </span>
          </motion.button>

          {/* Page indicator dots */}
          <div className="flex gap-1.5 flex-wrap justify-center max-w-[200px]">
            {Array.from({ length: totalPages }).map((_, i) => {
              const isActive = i === pageNumber;
              const isPast = i < pageNumber;
              return (
                <motion.div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor: isActive
                      ? bedtime
                        ? '#A78BFA'
                        : '#FF6B6B'
                      : isPast
                        ? bedtime
                          ? '#6366F1'
                          : '#FFB4B4'
                        : bedtime
                          ? '#374151'
                          : '#E5E7EB',
                  }}
                  animate={isActive ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                  transition={{ duration: 0.4 }}
                />
              );
            })}
          </div>

          {/* Next button */}
          <motion.button
            className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl cursor-pointer"
            style={{ backgroundColor: bedtime ? '#312E81' : '#FFFFFF' }}
            onClick={handleClickNext}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={pageNumber === totalPages - 1 ? 'Finish story' : 'Next page'}
          >
            <span style={{ color: bedtime ? '#C4B5FD' : '#374151' }}>
              {pageNumber === totalPages - 1 ? '🎉' : '▶️'}
            </span>
          </motion.button>
        </div>

        {/* Page counter */}
        <p
          className="text-center text-xs font-bold mt-2"
          style={{ color: bedtime ? '#6B7280' : '#9CA3AF' }}
        >
          {pageNumber + 1} of {totalPages}
        </p>
      </div>
    </div>
  );
}
