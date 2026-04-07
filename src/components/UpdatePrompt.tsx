// ============================================================
// UpdatePrompt -- Gentle update notification for Kids Learning Fun
// ============================================================
// Shows a non-intrusive banner when a new version of the app is
// available. Uses the app's cream/coral color scheme and is
// designed to be kid-friendly and parent-approved.
//
// Usage:
//   <UpdatePrompt
//     show={needsRefresh}
//     onAccept={() => swHandle.acceptUpdate()}
//     onDismiss={() => swHandle.dismissUpdate()}
//   />
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UpdatePromptProps {
  /** Whether to show the update banner */
  show: boolean;
  /** Called when the user taps "Update Now" */
  onAccept: () => void;
  /** Called when the user dismisses the banner */
  onDismiss: () => void;
}

export default function UpdatePrompt({ show, onAccept, onDismiss }: UpdatePromptProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Reset dismissed state when show changes (new update available)
  useEffect(() => {
    if (show) {
      setDismissed(false);
      setIsUpdating(false);
    }
  }, [show]);

  const handleAccept = useCallback(() => {
    setIsUpdating(true);
    onAccept();
  }, [onAccept]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    onDismiss();
  }, [onDismiss]);

  const visible = show && !dismissed;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          role="alert"
          aria-live="polite"
          className="fixed top-0 left-0 right-0 z-50 px-4 pt-3 pb-2"
          style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
        >
          <div
            className="mx-auto max-w-md rounded-2xl shadow-lg border-2 overflow-hidden"
            style={{
              backgroundColor: '#FFF8F0',
              borderColor: '#FF6B6B',
            }}
          >
            {/* Content area */}
            <div className="px-4 pt-3 pb-2">
              {/* Header with sparkle icon */}
              <div className="flex items-start gap-3">
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl"
                  style={{ backgroundColor: '#FFE66D' }}
                  aria-hidden="true"
                >
                  {/* Star/sparkle character */}
                  {'\u2728'}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="text-base font-bold leading-tight"
                    style={{ color: '#FF6B6B' }}
                  >
                    New activities available!
                  </p>
                  <p
                    className="text-sm mt-0.5 leading-snug"
                    style={{ color: '#6B6B7B' }}
                  >
                    Tap update to get the latest fun stuff.
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div
              className="flex border-t"
              style={{ borderColor: '#FFE66D' }}
            >
              {/* Dismiss button */}
              <button
                type="button"
                onClick={handleDismiss}
                disabled={isUpdating}
                className="flex-1 py-2.5 text-sm font-semibold transition-colors"
                style={{
                  color: '#9B9BAB',
                  backgroundColor: 'transparent',
                }}
                aria-label="Dismiss update notification. The update will apply next time you open the app."
              >
                Later
              </button>

              {/* Divider */}
              <div
                className="w-px"
                style={{ backgroundColor: '#FFE66D' }}
                aria-hidden="true"
              />

              {/* Update button */}
              <button
                type="button"
                onClick={handleAccept}
                disabled={isUpdating}
                className="flex-1 py-2.5 text-sm font-bold transition-colors"
                style={{
                  color: '#FFFFFF',
                  backgroundColor: '#FF6B6B',
                }}
                aria-label="Update the app now"
              >
                {isUpdating ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoadingSpinner />
                    Updating...
                  </span>
                ) : (
                  'Update Now'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Loading Spinner ─────────────────────────────────────────

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
