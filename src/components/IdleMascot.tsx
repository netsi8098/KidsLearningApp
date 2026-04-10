import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MascotLion from './svg/MascotLion';

const IDLE_TIMEOUT = 15000; // 15 seconds
const MESSAGES = [
  "Let's learn something!",
  "I found something cool!",
  "Ready for a challenge?",
  "You're doing amazing!",
  "Want to try a quiz?",
  "Let's read a story!",
];

export default function IdleMascot() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');

  const dismiss = useCallback(() => setVisible(false), []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    function resetTimer() {
      setVisible(false);
      clearTimeout(timer);
      timer = setTimeout(() => {
        setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
        setVisible(true);
      }, IDLE_TIMEOUT);
    }

    const events = ['mousedown', 'touchstart', 'keydown', 'scroll'];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-20 right-4 z-50 flex items-end gap-2 cursor-pointer"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          onClick={dismiss}
        >
          {/* Speech bubble */}
          <motion.div
            className="rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[180px]"
            style={{
              background: 'white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              border: '1px solid rgba(0,0,0,0.06)',
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="font-display text-sm text-[#2D2D3A]">{message}</p>
          </motion.div>

          {/* Mascot */}
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <MascotLion size={60} expression="waving" animated />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
