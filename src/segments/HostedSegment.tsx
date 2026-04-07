// ─── Hosted Segment Component ──────────────────────────────────────────────
// Renders a mascot-hosted educational "mini-show" that sequences through
// segments: intro, topic-reveal, teach, interaction, call-response, recap,
// goodbye. The host mascot speaks lines via TTS, shows expressions, and
// reacts to the child's interactions.

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { HostedEpisode, EpisodeSegment } from './episodeSchema';
import { segmentTypeLabel } from './episodeSchema';
import { useEpisodeFlow } from './useEpisodeFlow';
import { getCharacterById } from '../data/charactersData';

interface HostedSegmentProps {
  episode: HostedEpisode;
  onComplete?: () => void;
  onExit?: () => void;
}

// ─── Host character constants ──────────────────────────────────────────────

const EXPRESSION_EMOJIS: Record<string, string> = {
  excited: '😃',
  warm: '😊',
  curious: '🤔',
  singing: '🎵',
  celebrating: '🥳',
  encouraging: '💪',
  proud: '🌟',
  explaining: '👆',
  neutral: '😊',
};

// ─── Topic backgrounds ────────────────────────────────────────────────────

const TOPIC_BACKGROUNDS: Record<string, string> = {
  colors: 'bg-gradient-to-b from-pink-200 via-yellow-100 to-blue-200',
  counting: 'bg-gradient-to-b from-teal-200 via-cyan-100 to-indigo-200',
  shapes: 'bg-gradient-to-b from-purple-200 via-pink-100 to-orange-200',
  letters: 'bg-gradient-to-b from-green-200 via-lime-100 to-yellow-200',
  animals: 'bg-gradient-to-b from-amber-200 via-orange-100 to-green-200',
};

// ─── Segment Renderers ────────────────────────────────────────────────────

function IntroView({ segment, hostEmoji }: { segment: Extract<EpisodeSegment, { type: 'intro' }>; hostEmoji: string }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-6 text-center px-6"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      <motion.span
        className="text-8xl"
        animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        {hostEmoji}
      </motion.span>
      <motion.p
        className="text-xl font-bold text-gray-700 max-w-md leading-relaxed"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {segment.hostLine}
      </motion.p>
    </motion.div>
  );
}

function TopicRevealView({ segment }: { segment: Extract<EpisodeSegment, { type: 'topic-reveal' }> }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-6 text-center px-6"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
    >
      <motion.span
        className="text-9xl"
        animate={{ rotate: [0, 360], scale: [0.5, 1.2, 1] }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {segment.emoji}
      </motion.span>
      <motion.h2
        className="text-3xl font-extrabold text-gray-800"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {segment.title}
      </motion.h2>
      <motion.p
        className="text-lg font-medium text-gray-600 max-w-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {segment.hostLine}
      </motion.p>
    </motion.div>
  );
}

function TeachView({ segment }: { segment: Extract<EpisodeSegment, { type: 'teach' }> }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-6 text-center px-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.div
        className="text-7xl mb-2"
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
      >
        {segment.visual}
      </motion.div>
      <p className="text-xl font-bold text-gray-800 max-w-md leading-relaxed">
        {segment.content}
      </p>
      <motion.p
        className="text-base font-medium text-gray-500 max-w-sm leading-relaxed italic"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        "{segment.hostLine}"
      </motion.p>
    </motion.div>
  );
}

function InteractionView({
  segment,
  onAnswer,
  feedback,
}: {
  segment: Extract<EpisodeSegment, { type: 'interaction' }>;
  onAnswer: (answer: string) => void;
  feedback: { correct: boolean; message: string } | null;
}) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-6 text-center px-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <h3 className="text-2xl font-extrabold text-gray-800">{segment.prompt}</h3>

      {/* Options grid */}
      {segment.options && (
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          {segment.options.map((option, i) => (
            <motion.button
              key={i}
              className="bg-white rounded-2xl shadow-md p-6 text-5xl cursor-pointer hover:shadow-lg active:shadow-sm"
              onClick={() => onAnswer(option)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              {option}
            </motion.button>
          ))}
        </div>
      )}

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            className={`px-6 py-3 rounded-2xl font-bold text-lg ${
              feedback.correct
                ? 'bg-leaf/20 text-green-800'
                : 'bg-coral/20 text-red-800'
            }`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring' }}
          >
            {feedback.correct ? '🎉' : '💡'} {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CallResponseView({
  segment,
  onConfirm,
  confirmed,
}: {
  segment: Extract<EpisodeSegment, { type: 'call-response' }>;
  onConfirm: () => void;
  confirmed: boolean;
}) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-6 text-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.p
        className="text-2xl font-extrabold text-gray-800 max-w-md leading-relaxed"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        "{segment.hostLine}"
      </motion.p>

      {!confirmed ? (
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-lg text-gray-500 font-medium">
            Now you say it!
          </p>
          <motion.button
            className="px-8 py-4 rounded-2xl bg-coral text-white font-extrabold text-xl shadow-lg cursor-pointer"
            onClick={onConfirm}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            🎤 I said it!
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className="text-6xl"
        >
          🎉
        </motion.div>
      )}
    </motion.div>
  );
}

function RecapView({ segment }: { segment: Extract<EpisodeSegment, { type: 'recap' }> }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-6 text-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.span
        className="text-7xl"
        animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        ⭐
      </motion.span>
      <h3 className="text-2xl font-extrabold text-gray-800">Great Job!</h3>
      <p className="text-lg font-medium text-gray-600 max-w-md leading-relaxed">
        {segment.summary}
      </p>
      <motion.p
        className="text-base text-gray-500 italic max-w-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        "{segment.hostLine}"
      </motion.p>
    </motion.div>
  );
}

function GoodbyeView({ segment, hostEmoji }: { segment: Extract<EpisodeSegment, { type: 'goodbye' }>; hostEmoji: string }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-6 text-center px-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <motion.span
        className="text-8xl"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {hostEmoji}
      </motion.span>
      <p className="text-xl font-bold text-gray-700 max-w-md leading-relaxed">
        {segment.hostLine}
      </p>
      {segment.nextSuggestion && (
        <motion.p
          className="text-sm font-medium text-gray-400 bg-white/60 rounded-full px-4 py-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          Up next: {segment.nextSuggestion}
        </motion.p>
      )}
    </motion.div>
  );
}

// ─── Complete Screen ───────────────────────────────────────────────────────

function CompleteScreen({
  episode,
  correctCount,
  interactionCount,
  onComplete,
  onReplay,
  hostEmoji,
}: {
  episode: HostedEpisode;
  correctCount: number;
  interactionCount: number;
  onComplete?: () => void;
  onReplay: () => void;
  hostEmoji: string;
}) {
  return (
    <motion.div
      className="min-h-dvh bg-gradient-to-b from-sunny/30 via-cream to-cream flex flex-col items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.span
        className="text-8xl mb-4"
        animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        🎉
      </motion.span>
      <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Show Complete!</h2>
      <p className="text-gray-500 mb-4">
        You finished <span className="font-bold text-coral">{episode.title}</span>
      </p>

      {/* Score */}
      {interactionCount > 0 && (
        <motion.div
          className="bg-white rounded-2xl shadow-md px-6 py-4 mb-6 text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-lg font-bold text-gray-700">
            {correctCount} / {interactionCount} correct
          </p>
          <div className="flex justify-center gap-1 mt-2">
            {Array.from({ length: interactionCount }).map((_, i) => (
              <span key={i} className="text-xl">
                {i < correctCount ? '⭐' : '☆'}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Star earned */}
      <motion.div
        className="flex items-center gap-2 bg-gold/20 rounded-2xl px-6 py-3 mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.7, type: 'spring' }}
      >
        <span className="text-3xl">⭐</span>
        <span className="text-xl font-bold text-amber-700">+1 Star</span>
      </motion.div>

      <span className="text-5xl mb-6">{hostEmoji}</span>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <motion.button
          className="w-full bg-coral text-white font-bold py-3 px-6 rounded-2xl shadow-lg text-lg cursor-pointer"
          onClick={onComplete}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Continue
        </motion.button>
        <motion.button
          className="w-full bg-white text-gray-600 font-bold py-3 px-6 rounded-2xl shadow-md text-lg cursor-pointer"
          onClick={onReplay}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          🔄 Watch Again
        </motion.button>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════

export default function HostedSegment({ episode, onComplete, onExit }: HostedSegmentProps) {
  const flow = useEpisodeFlow(episode);
  const character = getCharacterById(episode.hostCharacterId);
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [callResponseConfirmed, setCallResponseConfirmed] = useState(false);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const bgClass = TOPIC_BACKGROUNDS[episode.topic] ?? 'bg-gradient-to-b from-cream to-white';

  // ─── TTS for host lines ──────────────────────────────────────────────
  useEffect(() => {
    if (flow.isComplete) return;

    const segment = flow.currentSegment;
    let line = '';

    switch (segment.type) {
      case 'intro':
        line = segment.hostLine;
        break;
      case 'topic-reveal':
        line = segment.hostLine;
        break;
      case 'teach':
        line = segment.hostLine;
        break;
      case 'call-response':
        line = segment.hostLine;
        break;
      case 'recap':
        line = segment.hostLine;
        break;
      case 'goodbye':
        line = segment.hostLine;
        break;
    }

    if (line && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(line);
      utter.rate = 0.85;
      utter.pitch = 1.1;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.name.includes('Samantha') ||
          v.name.includes('Karen') ||
          v.name.includes('Google') ||
          v.lang.startsWith('en'),
      );
      if (preferred) utter.voice = preferred;
      window.speechSynthesis.speak(utter);
    }

    // Reset interaction state on segment change
    setFeedback(null);
    setCallResponseConfirmed(false);

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [flow.currentSegment, flow.segmentIndex, flow.isComplete]);

  // ─── Auto-advance for non-interactive segments ───────────────────────
  useEffect(() => {
    if (flow.isComplete) return;
    const segment = flow.currentSegment;

    // Only auto-advance for segments that don't need input
    if (segment.type === 'interaction' || segment.type === 'call-response') return;

    const delay =
      segment.type === 'intro'
        ? (segment as Extract<EpisodeSegment, { type: 'intro' }>).durationMs
        : segment.type === 'topic-reveal'
          ? 5000
          : segment.type === 'teach'
            ? 7000
            : segment.type === 'recap'
              ? 6000
              : segment.type === 'goodbye'
                ? 5000
                : 4000;

    autoAdvanceTimerRef.current = setTimeout(() => {
      flow.advance();
    }, delay);

    return () => {
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, [flow.currentSegment, flow.segmentIndex, flow.isComplete]);

  // ─── Interaction handler ─────────────────────────────────────────────
  const handleAnswer = useCallback(
    (answer: string) => {
      const result = flow.handleInteraction(answer);
      setFeedback({ correct: result.correct, message: result.feedback });

      if (result.correct) {
        // Auto-advance after a short celebration
        setTimeout(() => {
          flow.advance();
        }, 1800);
      }
    },
    [flow],
  );

  // ─── Call-response handler ───────────────────────────────────────────
  const handleCallConfirm = useCallback(() => {
    setCallResponseConfirmed(true);
    flow.confirmCallResponse();

    // Auto-advance after celebration
    setTimeout(() => {
      flow.advance();
    }, 2000);
  }, [flow]);

  // ─── Replay ──────────────────────────────────────────────────────────
  const handleReplay = useCallback(() => {
    // Reload the component by re-mounting (parent should handle this)
    window.location.reload();
  }, []);

  // ─── Complete screen ─────────────────────────────────────────────────
  if (flow.isComplete) {
    return (
      <CompleteScreen
        episode={episode}
        correctCount={flow.correctCount}
        interactionCount={flow.interactionCount}
        onComplete={onComplete}
        onReplay={handleReplay}
        hostEmoji={character.emoji}
      />
    );
  }

  // ─── Segment content renderer ────────────────────────────────────────
  const renderSegmentContent = () => {
    const seg = flow.currentSegment;
    switch (seg.type) {
      case 'intro':
        return <IntroView segment={seg} hostEmoji={character.emoji} />;
      case 'topic-reveal':
        return <TopicRevealView segment={seg} />;
      case 'teach':
        return <TeachView segment={seg} />;
      case 'interaction':
        return <InteractionView segment={seg} onAnswer={handleAnswer} feedback={feedback} />;
      case 'call-response':
        return (
          <CallResponseView
            segment={seg}
            onConfirm={handleCallConfirm}
            confirmed={callResponseConfirmed}
          />
        );
      case 'recap':
        return <RecapView segment={seg} />;
      case 'goodbye':
        return <GoodbyeView segment={seg} hostEmoji={character.emoji} />;
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-dvh ${bgClass} relative flex flex-col`}>
      {/* ─── Segment progress indicators (top) ────────────────────── */}
      <div className="flex gap-1 px-4 pt-3">
        {episode.segments.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1.5 rounded-full transition-all duration-300"
            style={{
              backgroundColor:
                i < flow.segmentIndex
                  ? '#FF6B6B'
                  : i === flow.segmentIndex
                    ? '#FFE66D'
                    : '#E5E7EB',
            }}
          />
        ))}
      </div>

      {/* ─── Header ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pt-2 pb-1">
        <motion.button
          className="w-10 h-10 rounded-full bg-white/80 shadow-md flex items-center justify-center text-lg cursor-pointer"
          onClick={onExit}
          whileTap={{ scale: 0.9 }}
          aria-label="Exit episode"
        >
          ✕
        </motion.button>

        <div className="text-center flex-1 mx-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            {segmentTypeLabel(flow.currentSegment.type)}
          </p>
        </div>

        {/* Manual next button for interactive segments */}
        {!flow.isWaitingForInput &&
          flow.currentSegment.type !== 'interaction' &&
          flow.currentSegment.type !== 'call-response' && (
            <motion.button
              className="px-4 py-2 rounded-full bg-white/80 shadow-md text-sm font-bold text-gray-600 cursor-pointer"
              onClick={flow.advance}
              whileTap={{ scale: 0.9 }}
            >
              Skip
            </motion.button>
          )}

        {flow.isWaitingForInput && <div className="w-10" />}
      </div>

      {/* ─── Content area ─────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={flow.segmentIndex}
            className="w-full"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {renderSegmentContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── Host area (bottom-left) ─────────────────────────────── */}
      <div className="px-4 pb-6 flex items-end justify-between">
        {/* Mascot */}
        <motion.div
          className="flex items-end gap-2"
          animate={{
            y: flow.hostState.speaking ? [0, -4, 0] : 0,
          }}
          transition={{ duration: 0.6, repeat: flow.hostState.speaking ? Infinity : 0 }}
        >
          <div className="relative">
            <span className="text-5xl select-none">{character.emoji}</span>
            {/* Expression badge */}
            <motion.span
              className="absolute -top-1 -right-1 text-lg"
              key={flow.hostState.expression}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
            >
              {EXPRESSION_EMOJIS[flow.hostState.expression] ?? '😊'}
            </motion.span>
          </div>
          {/* Host speaking indicator */}
          {flow.hostState.speaking && (
            <motion.div
              className="flex gap-0.5 mb-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 rounded-full bg-coral"
                  animate={{ height: [4, 12, 4] }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.15,
                    repeat: Infinity,
                  }}
                />
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Host name + character badge */}
        <div className="text-right">
          <p className="text-xs font-bold text-gray-400">{character.name}</p>
          <p className="text-xs text-gray-300">
            {flow.segmentIndex + 1} / {flow.totalSegments}
          </p>
        </div>
      </div>
    </div>
  );
}
