import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { db } from '../db/database';
import { useApp } from './AppContext';

interface A11yState {
  reducedMotion: boolean;
  largerText: boolean;
  highContrast: boolean;
  toggleReducedMotion: () => void;
  toggleLargerText: () => void;
  toggleHighContrast: () => void;
}

const AccessibilityContext = createContext<A11yState | null>(null);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const { currentPlayer } = useApp();

  // Default from system preference
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });
  const [largerText, setLargerText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  // Sync from profile
  useEffect(() => {
    if (currentPlayer) {
      setReducedMotion(currentPlayer.a11yReducedMotion ?? false);
      setLargerText(currentPlayer.a11yLargerText ?? false);
      setHighContrast(currentPlayer.a11yHighContrast ?? false);
    }
  }, [currentPlayer]);

  // Apply CSS classes on root element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('reduced-motion', reducedMotion);
    root.classList.toggle('larger-text', largerText);
    root.classList.toggle('high-contrast', highContrast);
  }, [reducedMotion, largerText, highContrast]);

  const persist = useCallback(async (field: string, value: boolean) => {
    if (currentPlayer?.id) {
      await db.profiles.update(currentPlayer.id, { [field]: value });
    }
  }, [currentPlayer]);

  const toggleReducedMotion = useCallback(() => {
    setReducedMotion((v) => {
      const next = !v;
      persist('a11yReducedMotion', next);
      return next;
    });
  }, [persist]);

  const toggleLargerText = useCallback(() => {
    setLargerText((v) => {
      const next = !v;
      persist('a11yLargerText', next);
      return next;
    });
  }, [persist]);

  const toggleHighContrast = useCallback(() => {
    setHighContrast((v) => {
      const next = !v;
      persist('a11yHighContrast', next);
      return next;
    });
  }, [persist]);

  return (
    <AccessibilityContext.Provider
      value={{
        reducedMotion,
        largerText,
        highContrast,
        toggleReducedMotion,
        toggleLargerText,
        toggleHighContrast,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility must be inside AccessibilityProvider');
  return ctx;
}
