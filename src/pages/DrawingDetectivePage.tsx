import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useAudio } from '../hooks/useAudio';
import NavButton from '../components/NavButton';
import StarCounter from '../components/StarCounter';
import AIDrawingCanvas from '../components/AIDrawingCanvas';
import AIStatusBanner from '../components/AIStatusBanner';
import { analyzeImage, AI_PROMPTS, parseDrawing, type DrawingResult } from '../services/ollamaService';
import { aiSpeak, getSelectedAIVoice } from '../services/ttsService';

const COLOR = '#A78BFA';

type Phase = 'home' | 'drawing' | 'analyzing' | 'result';

export default function DrawingDetectivePage() {
  const navigate = useNavigate();
  const { currentPlayer, showCelebration } = useApp();
  const { playClick } = useAudio();

  const [phase, setPhase] = useState<Phase>('home');
  const [result, setResult] = useState<DrawingResult | null>(null);
  const [drawingImage, setDrawingImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!currentPlayer) return <Navigate to="/" replace />;

  async function handleSubmitDrawing(base64: string) {
    setDrawingImage(base64);
    setPhase('analyzing');
    setError(null);
    try {
      const raw = await analyzeImage(base64, AI_PROMPTS.drawingDetective);
      const parsed = parseDrawing(raw);
      setResult(parsed);
      setPhase('result');
      showCelebration();
      aiSpeak(`Hmm, I think you drew ${parsed.guess}! ${parsed.compliment}`, getSelectedAIVoice());
    } catch {
      setError('Oops! My drawing eye needs a rest. Try again!');
      setPhase('home');
    }
  }

  function handleTryAgain() {
    playClick();
    setResult(null);
    setDrawingImage(null);
    setPhase('home');
  }

  return (
    <div className="min-h-dvh bg-[#F8F5FF] p-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <NavButton onClick={() => navigate('/menu')} direction="back" />
        <h1 className="text-xl font-black" style={{ color: COLOR }}>Drawing Detective</h1>
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
              animate={{ rotate: [-5, 5, -5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-8xl"
            >
              🎨
            </motion.div>
            <h2 className="text-2xl font-black text-gray-800 text-center">
              Draw something and I'll guess!
            </h2>
            <p className="text-gray-500 text-center max-w-xs">
              Draw anything — an animal, a house, a monster — and I'll try to figure out what it is!
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { playClick(); setPhase('drawing'); }}
              className="px-8 py-4 rounded-2xl text-white font-black text-xl shadow-lg"
              style={{ backgroundColor: COLOR }}
            >
              🖌️ Start Drawing
            </motion.button>

            {error && (
              <p className="text-red-500 font-bold text-center">{error}</p>
            )}
          </motion.div>
        )}

        {/* DRAWING */}
        {phase === 'drawing' && (
          <AIDrawingCanvas
            onSubmit={handleSubmitDrawing}
            onClose={() => setPhase('home')}
            color={COLOR}
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
            {drawingImage && (
              <img
                src={`data:image/jpeg;base64,${drawingImage}`}
                alt="Your drawing"
                className="w-48 h-48 object-contain rounded-2xl shadow-md bg-white p-2"
              />
            )}
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-6xl"
            >
              🕵️
            </motion.div>
            <p className="text-xl font-bold text-gray-700">Hmm, let me look closely...</p>
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
            {drawingImage && (
              <img
                src={`data:image/jpeg;base64,${drawingImage}`}
                alt="Your drawing"
                className="w-full max-w-sm mx-auto h-48 object-contain rounded-2xl shadow-md bg-white p-2"
              />
            )}

            {/* Guess */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="bg-white rounded-2xl shadow-md p-5 text-center"
            >
              <p className="text-sm font-bold uppercase tracking-wide" style={{ color: COLOR }}>
                I think it's...
              </p>
              <p className="text-3xl font-black text-gray-800 mt-1">{result.guess}</p>
            </motion.div>

            {/* Compliment */}
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-md p-5"
            >
              <p className="text-sm font-bold uppercase tracking-wide text-pink-500">
                Great Job!
              </p>
              <p className="text-gray-700 mt-1">{result.compliment}</p>
            </motion.div>

            {/* Suggestion */}
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl shadow-md p-5"
            >
              <p className="text-sm font-bold uppercase tracking-wide" style={{ color: COLOR }}>
                Try Adding...
              </p>
              <p className="text-gray-700 mt-1">{result.suggestion}</p>
            </motion.div>

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTryAgain}
              className="mx-auto px-8 py-4 rounded-2xl text-white font-black text-lg shadow-lg mt-2"
              style={{ backgroundColor: COLOR }}
            >
              🎨 Draw Again!
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
