import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { checkOllamaStatus } from '../services/ollamaService';

interface AIStatusBannerProps {
  color: string;
}

export default function AIStatusBanner({ color }: AIStatusBannerProps) {
  const [status, setStatus] = useState<'checking' | 'ready' | 'offline'>('checking');

  useEffect(() => {
    checkOllamaStatus().then(({ running, modelReady }) => {
      setStatus(running && modelReady ? 'ready' : 'offline');
    });
  }, []);

  if (status === 'ready') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mx-4 mb-3 rounded-2xl p-4 text-white text-center font-bold"
        style={{ backgroundColor: status === 'checking' ? '#999' : '#EF4444' }}
      >
        {status === 'checking' ? (
          <div className="flex items-center justify-center gap-2">
            <span className="animate-spin">🔄</span> Connecting to AI brain...
          </div>
        ) : (
          <div>
            <p className="text-lg">AI Brain is Sleeping!</p>
            <p className="text-sm font-normal mt-1 opacity-90">
              Ask a grown-up to start Ollama on the computer
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
