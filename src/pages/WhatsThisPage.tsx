import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useAudio } from '../hooks/useAudio';
import NavButton from '../components/NavButton';
import StarCounter from '../components/StarCounter';
import CameraCapture from '../components/CameraCapture';
import AIStatusBanner from '../components/AIStatusBanner';
import { analyzeImage, AI_PROMPTS, parseWhatsThis, type WhatsThisResult } from '../services/ollamaService';
import { aiSpeak, getSelectedAIVoice } from '../services/ttsService';

const COLOR = '#4ECDC4';

type Phase = 'home' | 'camera' | 'analyzing' | 'result';

export default function WhatsThisPage() {
  const navigate = useNavigate();
  const { currentPlayer, showCelebration } = useApp();
  const { playClick } = useAudio();

  const [phase, setPhase] = useState<Phase>('home');
  const [result, setResult] = useState<WhatsThisResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!currentPlayer) return <Navigate to="/" replace />;

  async function handleCapture(base64: string) {
    setCapturedImage(base64);
    setPhase('analyzing');
    setError(null);
    try {
      const raw = await analyzeImage(base64, AI_PROMPTS.whatsThis);
      const parsed = parseWhatsThis(raw);
      setResult(parsed);
      setPhase('result');
      showCelebration();
      aiSpeak(`I see! It's ${parsed.object}!`, getSelectedAIVoice());
    } catch {
      setError('Oops! The AI brain could not figure it out. Try again!');
      setPhase('home');
    }
  }

  function handleTryAgain() {
    playClick();
    setResult(null);
    setCapturedImage(null);
    setPhase('home');
  }

  return (
    <div className="min-h-dvh bg-[#F0FFFE] p-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <NavButton onClick={() => navigate('/menu')} direction="back" />
        <h1 className="text-xl font-black" style={{ color: COLOR }}>What's This?</h1>
        <StarCounter />
      </div>

      <AIStatusBanner color={COLOR} />

      <AnimatePresence mode="wait">
        {/* HOME */}
        {phase === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-6 mt-8"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl"
            >
              🔍
            </motion.div>
            <h2 className="text-2xl font-black text-gray-800 text-center">
              Point your camera at anything!
            </h2>
            <p className="text-gray-500 text-center max-w-xs">
              I'll tell you what it is and share fun facts about it!
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { playClick(); setPhase('camera'); }}
              className="px-8 py-4 rounded-2xl text-white font-black text-xl shadow-lg"
              style={{ backgroundColor: COLOR }}
            >
              📷 Open Camera
            </motion.button>

            {error && (
              <p className="text-red-500 font-bold text-center">{error}</p>
            )}
          </motion.div>
        )}

        {/* CAMERA */}
        {phase === 'camera' && (
          <CameraCapture
            onCapture={handleCapture}
            onClose={() => setPhase('home')}
            color={COLOR}
            title="What's This?"
          />
        )}

        {/* ANALYZING */}
        {phase === 'analyzing' && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6 mt-12"
          >
            {capturedImage && (
              <img
                src={`data:image/jpeg;base64,${capturedImage}`}
                alt="Captured"
                className="w-48 h-48 object-cover rounded-2xl shadow-md"
              />
            )}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-6xl"
            >
              🧠
            </motion.div>
            <p className="text-xl font-bold text-gray-700">Thinking really hard...</p>
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLOR }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* RESULT */}
        {phase === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4"
          >
            {capturedImage && (
              <img
                src={`data:image/jpeg;base64,${capturedImage}`}
                alt="Captured"
                className="w-full max-w-sm mx-auto h-48 object-cover rounded-2xl shadow-md"
              />
            )}

            {/* Object Name */}
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-md p-5"
            >
              <p className="text-sm font-bold uppercase tracking-wide" style={{ color: COLOR }}>
                I found...
              </p>
              <p className="text-3xl font-black text-gray-800 mt-1">{result.object}</p>
            </motion.div>

            {/* Fun Facts */}
            {result.funFacts.length > 0 && (
              <motion.div
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-md p-5"
              >
                <p className="text-sm font-bold uppercase tracking-wide" style={{ color: COLOR }}>
                  Fun Facts
                </p>
                <ul className="mt-2 space-y-2">
                  {result.funFacts.map((fact, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.15 }}
                      className="flex gap-2 text-gray-700"
                    >
                      <span className="text-lg">⭐</span>
                      <span>{fact}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Activity */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="bg-white rounded-2xl shadow-md p-5"
            >
              <p className="text-sm font-bold uppercase tracking-wide" style={{ color: COLOR }}>
                Try This!
              </p>
              <p className="text-gray-700 mt-1">{result.activity}</p>
            </motion.div>

            {/* Try Again */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTryAgain}
              className="mx-auto px-8 py-4 rounded-2xl text-white font-black text-lg shadow-lg mt-2"
              style={{ backgroundColor: COLOR }}
            >
              🔍 Scan Something Else!
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
