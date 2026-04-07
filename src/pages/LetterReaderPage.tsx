import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useAudio } from '../hooks/useAudio';
import NavButton from '../components/NavButton';
import StarCounter from '../components/StarCounter';
import CameraCapture from '../components/CameraCapture';
import AIStatusBanner from '../components/AIStatusBanner';
import { analyzeImage, AI_PROMPTS, parseLetterReader, type LetterResult } from '../services/ollamaService';
import { aiSpeak, getSelectedAIVoice } from '../services/ttsService';

const COLOR = '#FF6B6B';

type Phase = 'home' | 'camera' | 'analyzing' | 'result';

export default function LetterReaderPage() {
  const navigate = useNavigate();
  const { currentPlayer, showCelebration } = useApp();
  const { playClick } = useAudio();

  const [phase, setPhase] = useState<Phase>('home');
  const [result, setResult] = useState<LetterResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!currentPlayer) return <Navigate to="/" replace />;

  async function handleCapture(base64: string) {
    setCapturedImage(base64);
    setPhase('analyzing');
    setError(null);
    try {
      const raw = await analyzeImage(base64, AI_PROMPTS.letterReader);
      const parsed = parseLetterReader(raw);
      setResult(parsed);
      setPhase('result');
      showCelebration();
      if (parsed.found) {
        aiSpeak(`I found some letters! ${parsed.found}`, getSelectedAIVoice());
      }
    } catch {
      setError('Oops! I couldn\'t read that. Try pointing at something with letters!');
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
    <div className="min-h-dvh bg-[#FFF5F5] p-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <NavButton onClick={() => navigate('/menu')} direction="back" />
        <h1 className="text-xl font-black" style={{ color: COLOR }}>Letter Reader</h1>
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
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-8xl"
            >
              📖
            </motion.div>
            <h2 className="text-2xl font-black text-gray-800 text-center">
              Point at letters or words!
            </h2>
            <p className="text-gray-500 text-center max-w-xs">
              I'll read them for you and help you learn new words!
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { playClick(); setPhase('camera'); }}
              className="px-8 py-4 rounded-2xl text-white font-black text-xl shadow-lg"
              style={{ backgroundColor: COLOR }}
            >
              📷 Scan Letters
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
            title="Find Letters!"
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
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="text-6xl"
            >
              🔤
            </motion.div>
            <p className="text-xl font-bold text-gray-700">Reading the letters...</p>
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

            {/* Found */}
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-md p-5"
            >
              <p className="text-sm font-bold uppercase tracking-wide" style={{ color: COLOR }}>
                I Found...
              </p>
              <p className="text-2xl font-black text-gray-800 mt-1 tracking-wider">{result.found}</p>
            </motion.div>

            {/* Sounds */}
            {result.sounds && (
              <motion.div
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-md p-5"
              >
                <p className="text-sm font-bold uppercase tracking-wide" style={{ color: COLOR }}>
                  How to Say It
                </p>
                <p className="text-gray-700 mt-1 text-lg">{result.sounds}</p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => aiSpeak(result.sounds, getSelectedAIVoice())}
                  className="mt-3 px-4 py-2 rounded-xl text-white font-bold"
                  style={{ backgroundColor: COLOR }}
                >
                  🔊 Hear It!
                </motion.button>
              </motion.div>
            )}

            {/* Fun Words */}
            {result.funWords && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-2xl shadow-md p-5"
              >
                <p className="text-sm font-bold uppercase tracking-wide" style={{ color: COLOR }}>
                  Fun Words
                </p>
                <p className="text-gray-700 mt-1">{result.funWords}</p>
              </motion.div>
            )}

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTryAgain}
              className="mx-auto px-8 py-4 rounded-2xl text-white font-black text-lg shadow-lg mt-2"
              style={{ backgroundColor: COLOR }}
            >
              📖 Read More!
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
