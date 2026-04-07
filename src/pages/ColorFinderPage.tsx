import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useAudio } from '../hooks/useAudio';
import NavButton from '../components/NavButton';
import StarCounter from '../components/StarCounter';
import CameraCapture from '../components/CameraCapture';
import AIStatusBanner from '../components/AIStatusBanner';
import { analyzeImage, AI_PROMPTS, parseColors, type ColorResult } from '../services/ollamaService';
import { aiSpeak, getSelectedAIVoice } from '../services/ttsService';

const COLOR = '#FFE66D';
const TEXT_COLOR = '#B8860B';

type Phase = 'home' | 'camera' | 'analyzing' | 'result';

export default function ColorFinderPage() {
  const navigate = useNavigate();
  const { currentPlayer, showCelebration } = useApp();
  const { playClick } = useAudio();

  const [phase, setPhase] = useState<Phase>('home');
  const [result, setResult] = useState<ColorResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!currentPlayer) return <Navigate to="/" replace />;

  async function handleCapture(base64: string) {
    setCapturedImage(base64);
    setPhase('analyzing');
    setError(null);
    try {
      const raw = await analyzeImage(base64, AI_PROMPTS.colorFinder);
      const parsed = parseColors(raw);
      setResult(parsed);
      setPhase('result');
      showCelebration();
      aiSpeak(`I see so many colors! The main color is ${parsed.mainColor}!`, getSelectedAIVoice());
    } catch {
      setError('Oops! My color vision is blurry. Try again!');
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
    <div className="min-h-dvh bg-[#FFFEF5] p-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <NavButton onClick={() => navigate('/menu')} direction="back" />
        <h1 className="text-xl font-black" style={{ color: TEXT_COLOR }}>Color Finder</h1>
        <StarCounter />
      </div>

      <AIStatusBanner color={TEXT_COLOR} />

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
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              className="text-8xl"
            >
              🌈
            </motion.div>
            <h2 className="text-2xl font-black text-gray-800 text-center">
              Find all the colors!
            </h2>
            <p className="text-gray-500 text-center max-w-xs">
              Point your camera at anything and I'll find every color hiding in it!
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { playClick(); setPhase('camera'); }}
              className="px-8 py-4 rounded-2xl font-black text-xl shadow-lg"
              style={{ backgroundColor: COLOR, color: TEXT_COLOR }}
            >
              📷 Find Colors
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
            color={TEXT_COLOR}
            title="Color Finder"
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
            <div className="flex gap-2">
              {['#FF6B6B', '#4ECDC4', '#FFE66D', '#A78BFA', '#6BCB77'].map((c, i) => (
                <motion.div
                  key={c}
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <p className="text-xl font-bold text-gray-700">Finding all the colors...</p>
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

            {/* Colors Found */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="bg-white rounded-2xl shadow-md p-5"
            >
              <p className="text-sm font-bold uppercase tracking-wide" style={{ color: TEXT_COLOR }}>
                Colors I Found
              </p>
              <p className="text-xl font-bold text-gray-800 mt-1">{result.colorsFound}</p>
            </motion.div>

            {/* Main Color */}
            {result.mainColor && (
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-md p-5 text-center"
              >
                <p className="text-sm font-bold uppercase tracking-wide" style={{ color: TEXT_COLOR }}>
                  The Star Color
                </p>
                <p className="text-3xl font-black text-gray-800 mt-1">{result.mainColor}</p>
              </motion.div>
            )}

            {/* Color Friends */}
            {result.colorFriends.length > 0 && (
              <motion.div
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-2xl shadow-md p-5"
              >
                <p className="text-sm font-bold uppercase tracking-wide" style={{ color: TEXT_COLOR }}>
                  Color Friends
                </p>
                <ul className="mt-2 space-y-2">
                  {result.colorFriends.map((friend, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.1 }}
                      className="flex gap-2 text-gray-700"
                    >
                      <span className="text-lg">🎨</span>
                      <span>{friend}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Activity */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="bg-white rounded-2xl shadow-md p-5"
            >
              <p className="text-sm font-bold uppercase tracking-wide" style={{ color: TEXT_COLOR }}>
                Color Activity
              </p>
              <p className="text-gray-700 mt-1">{result.activity}</p>
            </motion.div>

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTryAgain}
              className="mx-auto px-8 py-4 rounded-2xl font-black text-lg shadow-lg mt-2"
              style={{ backgroundColor: COLOR, color: TEXT_COLOR }}
            >
              🌈 Find More Colors!
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
