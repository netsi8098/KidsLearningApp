// ─── Episode Flow Control Hook ─────────────────────────────────────────────
// Manages sequential playback of hosted episode segments, interaction
// handling, and host mascot state transitions.

import { useState, useCallback, useMemo } from 'react';
import type {
  HostedEpisode,
  EpisodeSegment,
  InteractionSegment,
} from './episodeSchema';

// ─── Host State ────────────────────────────────────────────────────────────

export interface HostState {
  expression: string;
  pose: string;
  speaking: boolean;
}

// ─── Interaction Feedback ──────────────────────────────────────────────────

export interface InteractionResult {
  correct: boolean;
  feedback: string;
}

// ─── Hook Return ───────────────────────────────────────────────────────────

export interface EpisodeFlowState {
  currentSegment: EpisodeSegment;
  segmentIndex: number;
  totalSegments: number;
  isComplete: boolean;
  advance: () => void;
  handleInteraction: (answer: string) => InteractionResult;
  hostState: HostState;
  /** Whether the current segment is waiting for user input before advancing */
  isWaitingForInput: boolean;
  /** For call-response: user taps to confirm they responded */
  confirmCallResponse: () => void;
  /** Number of correct answers so far */
  correctCount: number;
  /** Total interaction segments encountered so far */
  interactionCount: number;
  /** Progress 0-1 */
  progress: number;
}

// ─── Default host states per segment type ──────────────────────────────────

function getHostStateForSegment(segment: EpisodeSegment): HostState {
  switch (segment.type) {
    case 'intro':
      return {
        expression: segment.hostExpression,
        pose: segment.hostPose,
        speaking: true,
      };
    case 'topic-reveal':
      return { expression: 'excited', pose: 'pointing', speaking: true };
    case 'teach':
      return { expression: 'explaining', pose: 'presenting', speaking: true };
    case 'interaction':
      return { expression: 'curious', pose: 'waiting', speaking: false };
    case 'call-response':
      return { expression: 'singing', pose: 'singing', speaking: true };
    case 'recap':
      return {
        expression: segment.hostExpression,
        pose: 'celebrating',
        speaking: true,
      };
    case 'goodbye':
      return { expression: 'warm', pose: 'waving', speaking: true };
    default:
      return { expression: 'neutral', pose: 'idle', speaking: false };
  }
}

// ─── Positive feedback messages ────────────────────────────────────────────

const CORRECT_FEEDBACK = [
  'Amazing! That\'s exactly right!',
  'ROAR! You got it! Great job!',
  'Hoot hoot! Perfect answer!',
  'Yes! You\'re so smart!',
  'Wonderful! That\'s correct!',
  'You did it! High five!',
];

const WRONG_FEEDBACK = [
  'Hmm, not quite! Let\'s try again!',
  'Close! Give it another try!',
  'Oops! That\'s okay, try once more!',
  'Almost! You can do it!',
];

function randomFrom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ═══════════════════════════════════════════════════════════════════════════
// Hook
// ═══════════════════════════════════════════════════════════════════════════

export function useEpisodeFlow(episode: HostedEpisode): EpisodeFlowState {
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [interactionCount, setInteractionCount] = useState(0);
  const [hostOverride, setHostOverride] = useState<HostState | null>(null);

  const totalSegments = episode.segments.length;
  const currentSegment = episode.segments[Math.min(segmentIndex, totalSegments - 1)];
  const progress = totalSegments > 0 ? segmentIndex / totalSegments : 0;

  // Determine host state: use override if set, otherwise derive from segment
  const hostState = useMemo(() => {
    if (hostOverride) return hostOverride;
    return getHostStateForSegment(currentSegment);
  }, [currentSegment, hostOverride]);

  // Check if current segment requires input
  const segmentRequiresInput = useCallback((seg: EpisodeSegment): boolean => {
    return seg.type === 'interaction' || seg.type === 'call-response';
  }, []);

  // ─── Advance to next segment ────────────────────────────────────────
  const advance = useCallback(() => {
    if (isComplete) return;

    const nextIndex = segmentIndex + 1;
    if (nextIndex >= totalSegments) {
      setIsComplete(true);
      setHostOverride({ expression: 'celebrating', pose: 'waving', speaking: true });
      return;
    }

    setSegmentIndex(nextIndex);
    setHostOverride(null);

    const nextSegment = episode.segments[nextIndex];
    if (segmentRequiresInput(nextSegment)) {
      setIsWaitingForInput(true);
    } else {
      setIsWaitingForInput(false);
    }
  }, [segmentIndex, totalSegments, episode.segments, isComplete, segmentRequiresInput]);

  // ─── Handle interaction answer ──────────────────────────────────────
  const handleInteraction = useCallback(
    (answer: string): InteractionResult => {
      if (currentSegment.type !== 'interaction') {
        return { correct: false, feedback: 'No interaction on this segment.' };
      }

      const segment = currentSegment as InteractionSegment;
      setInteractionCount((c) => c + 1);

      const isCorrect = segment.correctAnswer
        ? answer.trim() === segment.correctAnswer.trim()
        : true; // If no correct answer, any answer is accepted

      if (isCorrect) {
        setCorrectCount((c) => c + 1);
        setIsWaitingForInput(false);
        setHostOverride({
          expression: 'celebrating',
          pose: 'cheering',
          speaking: true,
        });

        // Auto-advance after brief celebration delay
        return {
          correct: true,
          feedback: randomFrom(CORRECT_FEEDBACK),
        };
      }

      // Wrong answer
      setHostOverride({
        expression: 'encouraging',
        pose: 'thinking',
        speaking: true,
      });

      return {
        correct: false,
        feedback: segment.hostHint ?? randomFrom(WRONG_FEEDBACK),
      };
    },
    [currentSegment],
  );

  // ─── Confirm call-and-response ──────────────────────────────────────
  const confirmCallResponse = useCallback(() => {
    if (currentSegment.type !== 'call-response') return;

    setIsWaitingForInput(false);
    if (currentSegment.celebrateOnResponse) {
      setHostOverride({
        expression: 'celebrating',
        pose: 'cheering',
        speaking: true,
      });
    }
  }, [currentSegment]);

  return {
    currentSegment,
    segmentIndex,
    totalSegments,
    isComplete,
    advance,
    handleInteraction,
    hostState,
    isWaitingForInput,
    confirmCallResponse,
    correctCount,
    interactionCount,
    progress,
  };
}
