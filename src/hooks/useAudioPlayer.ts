import { useState, useRef, useEffect, useCallback } from 'react';
import { db } from '../db/database';
import type { AudioEpisode } from '../data/audioData';
import { aiSpeak, stopSpeaking, getSelectedAIVoice } from '../services/ttsService';

export interface UseAudioPlayerReturn {
  isPlaying: boolean;
  currentEpisode: AudioEpisode | null;
  playEpisode: (episode: AudioEpisode) => void;
  pause: () => void;
  resume: () => void;
  playbackSpeed: number;
  setSpeed: (speed: number) => void;
  sleepTimerMinutes: number | null;
  setSleepTimer: (minutes: number | null) => void;
  markComplete: (episodeId: string) => Promise<void>;
}

export function useAudioPlayer(playerId: number | undefined): UseAudioPlayerReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState<AudioEpisode | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number | null>(null);

  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentEpisodeRef = useRef<AudioEpisode | null>(null);

  // Keep ref in sync
  useEffect(() => {
    currentEpisodeRef.current = currentEpisode;
  }, [currentEpisode]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    };
  }, []);

  // Sleep timer
  useEffect(() => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }

    if (sleepTimerMinutes && sleepTimerMinutes > 0 && isPlaying) {
      sleepTimerRef.current = setTimeout(() => {
        stopSpeaking();
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        setIsPlaying(false);
        setSleepTimerMinutes(null);
      }, sleepTimerMinutes * 60 * 1000);
    }

    return () => {
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    };
  }, [sleepTimerMinutes, isPlaying]);

  const saveProgress = useCallback(
    async (episodeId: string, completed: boolean) => {
      if (!playerId) return;
      const existing = await db.audioProgress
        .where('[playerId+episodeId]')
        .equals([playerId, episodeId])
        .first();

      if (existing) {
        await db.audioProgress.update(existing.id!, {
          completed: completed || existing.completed,
          lastListenedAt: new Date(),
        });
      } else {
        await db.audioProgress.add({
          playerId,
          episodeId,
          currentTime: 0,
          duration: 0,
          completed,
          favorite: false,
          lastListenedAt: new Date(),
        });
      }
    },
    [playerId]
  );

  const playEpisode = useCallback(
    (episode: AudioEpisode) => {
      // Stop any current playback
      stopSpeaking();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();

      setCurrentEpisode(episode);
      setIsPlaying(true);
      saveProgress(episode.id, false);

      // Use AI voice — fire and forget, track completion via promise
      const voice = getSelectedAIVoice();
      aiSpeak(episode.ttsText, voice).then(() => {
        // Only mark done if this episode is still the current one
        if (currentEpisodeRef.current?.id === episode.id) {
          setIsPlaying(false);
          saveProgress(episode.id, true);
        }
      }).catch(() => {
        setIsPlaying(false);
      });
    },
    [saveProgress]
  );

  const pause = useCallback(() => {
    stopSpeaking();
    if ('speechSynthesis' in window) window.speechSynthesis.pause();
    setIsPlaying(false);
  }, []);

  const resume = useCallback(() => {
    const ep = currentEpisodeRef.current;
    if (ep) {
      setIsPlaying(true);
      const voice = getSelectedAIVoice();
      aiSpeak(ep.ttsText, voice).then(() => {
        if (currentEpisodeRef.current?.id === ep.id) {
          setIsPlaying(false);
          saveProgress(ep.id, true);
        }
      }).catch(() => {
        setIsPlaying(false);
      });
    }
  }, [saveProgress]);

  const setSpeed = useCallback(
    (speed: number) => {
      setPlaybackSpeed(speed);
    },
    []
  );

  const setSleepTimer = useCallback((minutes: number | null) => {
    setSleepTimerMinutes(minutes);
  }, []);

  const markComplete = useCallback(
    async (episodeId: string) => {
      await saveProgress(episodeId, true);
    },
    [saveProgress]
  );

  return {
    isPlaying,
    currentEpisode,
    playEpisode,
    pause,
    resume,
    playbackSpeed,
    setSpeed,
    sleepTimerMinutes,
    setSleepTimer,
    markComplete,
  };
}
