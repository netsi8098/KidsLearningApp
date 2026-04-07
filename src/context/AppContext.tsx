import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { PlayerProfile } from '../db/database';
import type { TimeMode } from '../registry/types';
import { getAutoTimeMode } from '../registry/timeOfDayConfig';

interface AppState {
  currentPlayer: PlayerProfile | null;
  setCurrentPlayer: (player: PlayerProfile | null) => void;
  celebrationVisible: boolean;
  showCelebration: () => void;
  hideCelebration: () => void;
  starBurstVisible: boolean;
  showStarBurst: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  speechEnabled: boolean;
  setSpeechEnabled: (enabled: boolean) => void;
  badgeToast: { emoji: string; name: string } | null;
  showBadgeToast: (emoji: string, name: string) => void;
  bedtimeMode: boolean;
  setBedtimeMode: (on: boolean) => void;
  activeCharacter: string;
  setActiveCharacter: (id: string) => void;
  timeMode: TimeMode;
  setTimeMode: (mode: TimeMode) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPlayer, setCurrentPlayer] = useState<PlayerProfile | null>(null);
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [starBurstVisible, setStarBurstVisible] = useState(false);
  const [badgeToast, setBadgeToast] = useState<{ emoji: string; name: string } | null>(null);
  const [bedtimeMode, setBedtimeModeState] = useState(false);
  const [activeCharacter, setActiveCharacter] = useState('leo');
  const [timeMode, setTimeModeState] = useState<TimeMode>(getAutoTimeMode);

  // Persist sound settings in localStorage
  const [soundEnabled, setSoundEnabledState] = useState(() => {
    try { return localStorage.getItem('kidlearn-sound') !== 'false'; } catch { return true; }
  });
  const [speechEnabled, setSpeechEnabledState] = useState(() => {
    try { return localStorage.getItem('kidlearn-speech') !== 'false'; } catch { return true; }
  });

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled);
    try { localStorage.setItem('kidlearn-sound', String(enabled)); } catch {}
  }, []);

  const setSpeechEnabled = useCallback((enabled: boolean) => {
    setSpeechEnabledState(enabled);
    try { localStorage.setItem('kidlearn-speech', String(enabled)); } catch {}
  }, []);

  const showCelebration = useCallback(() => {
    setCelebrationVisible(true);
    setTimeout(() => setCelebrationVisible(false), 3000);
  }, []);

  const hideCelebration = useCallback(() => {
    setCelebrationVisible(false);
  }, []);

  const showStarBurst = useCallback(() => {
    setStarBurstVisible(true);
    setTimeout(() => setStarBurstVisible(false), 1500);
  }, []);

  const showBadgeToast = useCallback((emoji: string, name: string) => {
    setBadgeToast({ emoji, name });
    setTimeout(() => setBadgeToast(null), 3500);
  }, []);

  const setBedtimeMode = useCallback((on: boolean) => {
    setBedtimeModeState(on);
    if (on) {
      document.documentElement.classList.add('bedtime-mode');
    } else {
      document.documentElement.classList.remove('bedtime-mode');
    }
  }, []);

  // Sync bedtime mode from profile on player change
  useEffect(() => {
    if (currentPlayer?.bedtimeMode) {
      setBedtimeMode(true);
    } else {
      setBedtimeMode(false);
    }
  }, [currentPlayer, setBedtimeMode]);

  // Sync character preference from profile
  useEffect(() => {
    if (currentPlayer?.characterPreference) {
      setActiveCharacter(currentPlayer.characterPreference);
    }
  }, [currentPlayer]);

  const setTimeMode = useCallback((mode: TimeMode) => {
    setTimeModeState(mode);
  }, []);

  // Auto-detect time mode on mount and when player changes
  useEffect(() => {
    if (currentPlayer?.timeModeOverride) {
      setTimeModeState(currentPlayer.timeModeOverride as TimeMode);
    } else {
      setTimeModeState(getAutoTimeMode());
    }
  }, [currentPlayer]);

  // Cancel speech when leaving a page
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentPlayer]);

  return (
    <AppContext.Provider
      value={{
        currentPlayer,
        setCurrentPlayer,
        celebrationVisible,
        showCelebration,
        hideCelebration,
        starBurstVisible,
        showStarBurst,
        soundEnabled,
        setSoundEnabled,
        speechEnabled,
        setSpeechEnabled,
        badgeToast,
        showBadgeToast,
        bedtimeMode,
        setBedtimeMode,
        activeCharacter,
        setActiveCharacter,
        timeMode,
        setTimeMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
