// ── useVoiceLine Hook ──────────────────────────────────────────────────────
// Context-aware voice line playback via the Web SpeechSynthesis API.
// Handles line rotation, age-group filtering, bedtime mode, and graceful
// fallback when speech is unavailable or disabled.

import { useState, useCallback, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getVoiceProfile, getProfileForCharacter } from './voiceProfiles';
import type { VoiceProfileId } from './voiceProfiles';
import {
  voiceLines,
  getVoiceLineById,
  queryVoiceLines,
  type LineCategory,
  type EmotionTag,
  type ContextTag,
  type AgeGroup,
  type VoiceLine,
} from './voiceLines';
import { ageGroupRules, type SpeechAgeGroup } from './speechRules';

// ── Types ──────────────────────────────────────────────────────────────────

export interface SpeakOptions {
  /** Override the voice profile for this utterance */
  profileOverride?: VoiceProfileId;
  /** Callback when the utterance finishes */
  onEnd?: () => void;
  /** Callback on error */
  onError?: (error: SpeechSynthesisErrorEvent) => void;
  /** Force play even if speech is globally disabled (use sparingly) */
  force?: boolean;
}

export interface UseVoiceLineReturn {
  /** Speak a specific line by its ID */
  speak: (lineId: string, options?: SpeakOptions) => void;
  /** Speak a contextually matched line */
  speakByContext: (context: ContextTag, emotion?: EmotionTag) => void;
  /** Speak a random line from a category */
  speakRandom: (category: LineCategory) => void;
  /** Stop all speech immediately */
  stop: () => void;
  /** Whether speech is currently playing */
  isSpeaking: boolean;
  /** The ID of the last spoken line, or null */
  lastSpokenId: string | null;
}

// ── Constants ──────────────────────────────────────────────────────────────

/** How many recent line IDs to track for rotation */
const ROTATION_HISTORY_SIZE = 10;

/** Whether the SpeechSynthesis API is available */
const HAS_SPEECH = typeof window !== 'undefined' && 'speechSynthesis' in window;

// ── Voice Selection Cache ──────────────────────────────────────────────────

let _cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices(): SpeechSynthesisVoice[] {
  if (!HAS_SPEECH) return [];
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) _cachedVoices = voices;
  return _cachedVoices;
}

// Pre-load voices (some browsers load them asynchronously)
if (HAS_SPEECH) {
  loadVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
}

/**
 * Find the best matching voice for a profile.
 */
function findVoiceForProfile(profileId: VoiceProfileId): SpeechSynthesisVoice | null {
  const voices = loadVoices();
  if (voices.length === 0) return null;
  const profile = getVoiceProfile(profileId);
  const preferredName = profile.ttsHints.preferredVoiceName;
  const lang = profile.ttsHints.lang;

  // 1. Try exact name match
  if (preferredName) {
    const byName = voices.find((v) => v.name.includes(preferredName));
    if (byName) return byName;
  }

  // 2. Try Google voices (commonly available in Chrome)
  const googleVoice = voices.find(
    (v) => v.name.includes('Google') && v.lang.startsWith(lang.split('-')[0]),
  );
  if (googleVoice) return googleVoice;

  // 3. Try any English voice
  const enVoice = voices.find((v) => v.lang.startsWith('en'));
  if (enVoice) return enVoice;

  // 4. First available
  return voices[0] ?? null;
}

// ── Hook Implementation ────────────────────────────────────────────────────

export function useVoiceLine(characterId?: string): UseVoiceLineReturn {
  const { speechEnabled, bedtimeMode, currentPlayer } = useApp();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastSpokenId, setLastSpokenId] = useState<string | null>(null);

  // Recent line IDs for rotation (persists across renders)
  const recentIds = useRef<Set<string>>(new Set());
  const recentQueue = useRef<string[]>([]);

  // Current utterance reference for cancellation
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);

  // Derive the player's age group for line filtering
  const playerAgeGroup: AgeGroup = currentPlayer?.ageGroup ?? '4-5';

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (HAS_SPEECH) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /**
   * Track a line ID in the rotation history.
   */
  const trackLineId = useCallback((id: string) => {
    const queue = recentQueue.current;
    const set = recentIds.current;

    if (set.has(id)) return; // already tracked

    queue.push(id);
    set.add(id);

    // Evict oldest if over the limit
    while (queue.length > ROTATION_HISTORY_SIZE) {
      const evicted = queue.shift();
      if (evicted) set.delete(evicted);
    }
  }, []);

  /**
   * Pick the best line from a list, avoiding recently spoken ones.
   */
  const pickLine = useCallback(
    (candidates: VoiceLine[]): VoiceLine | null => {
      if (candidates.length === 0) return null;

      // Filter out recently spoken
      const fresh = candidates.filter((l) => !recentIds.current.has(l.id));

      // If all have been spoken recently, reset and use all
      const pool = fresh.length > 0 ? fresh : candidates;

      // Sort by priority (1 = highest), then pick randomly among top priority
      const sorted = [...pool].sort((a, b) => a.priority - b.priority);
      const topPriority = sorted[0].priority;
      const topTier = sorted.filter((l) => l.priority === topPriority);

      return topTier[Math.floor(Math.random() * topTier.length)];
    },
    [],
  );

  /**
   * Internal: perform the actual speech synthesis.
   */
  const performSpeak = useCallback(
    (line: VoiceLine, options?: SpeakOptions) => {
      if (!HAS_SPEECH) return;
      if (!speechEnabled && !options?.force) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const profileId = options?.profileOverride ?? line.voiceProfileId;
      const profile = getVoiceProfile(profileId);

      const utterance = new SpeechSynthesisUtterance(line.text);

      // Apply voice profile settings
      utterance.rate = profile.ttsHints.rate;
      utterance.pitch = profile.ttsHints.pitch;
      utterance.volume = profile.ttsHints.volume;
      utterance.lang = profile.ttsHints.lang;

      // Apply age-group rate adjustment
      const ageRules = ageGroupRules[playerAgeGroup as SpeechAgeGroup];
      if (ageRules) {
        utterance.rate *= ageRules.rateMultiplier;
        utterance.pitch += ageRules.pitchOffset;
        // Clamp values
        utterance.rate = Math.max(0.5, Math.min(2.0, utterance.rate));
        utterance.pitch = Math.max(0, Math.min(2.0, utterance.pitch));
      }

      // Find best voice
      const voice = findVoiceForProfile(profileId);
      if (voice) utterance.voice = voice;

      // Event handlers
      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        currentUtterance.current = null;
        options?.onEnd?.();
      };

      utterance.onerror = (event) => {
        setIsSpeaking(false);
        currentUtterance.current = null;
        options?.onError?.(event);
      };

      currentUtterance.current = utterance;
      trackLineId(line.id);
      setLastSpokenId(line.id);

      window.speechSynthesis.speak(utterance);
    },
    [speechEnabled, playerAgeGroup, trackLineId],
  );

  // ── Public API ─────────────────────────────────────────────────────────

  /**
   * Speak a specific line by its unique ID.
   */
  const speak = useCallback(
    (lineId: string, options?: SpeakOptions) => {
      const line = getVoiceLineById(lineId);
      if (!line) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[useVoiceLine] Line not found: ${lineId}`);
        }
        return;
      }
      performSpeak(line, options);
    },
    [performSpeak],
  );

  /**
   * Speak a contextually matched line. In bedtime mode, automatically
   * filters for calm/sleepy emotions and bedtime-narrator profile.
   */
  const speakByContext = useCallback(
    (context: ContextTag, emotion?: EmotionTag) => {
      let effectiveEmotion = emotion;
      let effectiveContext = context;

      // Bedtime mode overrides
      if (bedtimeMode) {
        effectiveEmotion = effectiveEmotion ?? 'calm';
        if (!['bedtime'].includes(effectiveContext)) {
          // Allow bedtime context lines to surface even when context is different
          effectiveContext = context;
        }
      }

      const candidates = queryVoiceLines({
        context: effectiveContext,
        emotion: effectiveEmotion,
        ageGroup: playerAgeGroup as AgeGroup,
        characterId,
      });

      // If bedtime mode and no direct matches, try bedtime category
      const pool =
        bedtimeMode && candidates.length === 0
          ? queryVoiceLines({ context: 'bedtime', ageGroup: playerAgeGroup as AgeGroup })
          : candidates;

      const line = pickLine(pool);
      if (line) {
        const profileOverride = bedtimeMode
          ? 'bedtime-narrator' as VoiceProfileId
          : characterId
          ? getProfileForCharacter(characterId, false)
          : undefined;

        performSpeak(line, { profileOverride });
      }
    },
    [bedtimeMode, playerAgeGroup, characterId, pickLine, performSpeak],
  );

  /**
   * Speak a random line from a given category, with rotation.
   */
  const speakRandom = useCallback(
    (category: LineCategory) => {
      // In bedtime mode, override to bedtime category for most requests
      const effectiveCategory =
        bedtimeMode && !['bedtime', 'goodbye'].includes(category)
          ? 'bedtime'
          : category;

      const candidates = queryVoiceLines({
        category: effectiveCategory,
        ageGroup: playerAgeGroup as AgeGroup,
        characterId,
      });

      // Fallback: if character-specific lines are empty, try without character filter
      const pool =
        candidates.length === 0
          ? queryVoiceLines({
              category: effectiveCategory,
              ageGroup: playerAgeGroup as AgeGroup,
            })
          : candidates;

      const line = pickLine(pool);
      if (line) {
        const profileOverride = bedtimeMode ? 'bedtime-narrator' as VoiceProfileId : undefined;
        performSpeak(line, { profileOverride });
      }
    },
    [bedtimeMode, playerAgeGroup, characterId, pickLine, performSpeak],
  );

  /**
   * Stop all speech immediately.
   */
  const stop = useCallback(() => {
    if (HAS_SPEECH) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    currentUtterance.current = null;
  }, []);

  return {
    speak,
    speakByContext,
    speakRandom,
    stop,
    isSpeaking,
    lastSpokenId,
  };
}
