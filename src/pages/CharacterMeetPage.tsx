import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { db } from '../db/database';
import { charactersData, type CharacterData } from '../data/charactersData';
import NavButton from '../components/NavButton';
import MascotBubble from '../components/MascotBubble';

export default function CharacterMeetPage() {
  const navigate = useNavigate();
  const { currentPlayer, setActiveCharacter } = useApp();
  const [selectedChar, setSelectedChar] = useState<CharacterData | null>(null);
  const [greeting, setGreeting] = useState('');

  if (!currentPlayer) return <Navigate to="/" replace />;

  async function handleSelectCharacter(char: CharacterData) {
    setSelectedChar(char);
    const randomGreeting =
      char.greetings[Math.floor(Math.random() * char.greetings.length)];
    setGreeting(randomGreeting);

    // Persist to DB and update context
    if (currentPlayer?.id) {
      await db.profiles.update(currentPlayer.id, {
        characterPreference: char.id,
      });
      setActiveCharacter(char.id);
    }
  }

  return (
    <div className="min-h-dvh bg-cream p-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <NavButton onClick={() => navigate('/menu')} direction="back" />
        <h2 className="text-xl font-bold text-amber-700">Meet the Crew! 🎭</h2>
        <div className="w-14" />
      </div>

      {/* Mascot greeting bubble */}
      {selectedChar && (
        <motion.div
          key={selectedChar.id}
          className="max-w-md mx-auto mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <MascotBubble
            message={greeting}
            characterId={selectedChar.id}
          />
        </motion.div>
      )}

      {/* Character grid */}
      <div className="max-w-md mx-auto grid grid-cols-1 gap-4">
        {charactersData.map((char, i) => {
          const isActive = currentPlayer?.characterPreference === char.id ||
            (!currentPlayer?.characterPreference && char.id === 'leo');
          return (
            <motion.button
              key={char.id}
              className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-4 text-left cursor-pointer transition-colors"
              style={{
                borderWidth: 3,
                borderColor: isActive ? char.color : 'transparent',
              }}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.08, type: 'spring', stiffness: 200 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelectCharacter(char)}
            >
              {/* Emoji avatar */}
              <div
                className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-4xl"
                style={{ backgroundColor: char.color + '25' }}
              >
                {char.emoji}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-base text-gray-800">
                    {char.name}
                  </p>
                  {isActive && (
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: char.color }}
                    >
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 capitalize mb-1">
                  {char.personality} personality
                </p>
                <p className="text-sm text-gray-600 leading-snug">
                  {char.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
