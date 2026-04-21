/**
 * OfflineBanner — shows a subtle banner when the device is offline.
 * Automatically hides when connection is restored.
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[9990] text-center py-2 px-4 text-sm font-bold text-white"
          style={{ background: 'linear-gradient(90deg, #FF8C42, #FF6B6B)' }}
          initial={{ y: -40 }}
          animate={{ y: 0 }}
          exit={{ y: -40 }}
        >
          You&apos;re offline — some features may be limited
        </motion.div>
      )}
    </AnimatePresence>
  );
}
