import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useWeeklyRecap } from '../hooks/useWeeklyRecap';
import NavButton from '../components/NavButton';

const typeLabels: Record<string, { label: string; emoji: string }> = {
  alphabet: { label: 'Letters', emoji: '🔤' },
  number: { label: 'Numbers', emoji: '🔢' },
  lesson: { label: 'Lessons', emoji: '📚' },
  story: { label: 'Stories', emoji: '📖' },
  video: { label: 'Videos', emoji: '🎬' },
  game: { label: 'Games', emoji: '🎮' },
  movement: { label: 'Movement', emoji: '💃' },
  cooking: { label: 'Cooking', emoji: '🍪' },
  coloring: { label: 'Coloring', emoji: '🎨' },
  audio: { label: 'Audio', emoji: '🎧' },
  explorer: { label: 'Explorer', emoji: '🌍' },
  emotion: { label: 'Emotions', emoji: '💛' },
};

export default function WeeklyRecapPage() {
  const { currentPlayer } = useApp();
  const { recaps, generateCurrentWeekRecap } = useWeeklyRecap(currentPlayer?.id);

  useEffect(() => {
    generateCurrentWeekRecap();
  }, [currentPlayer?.id]);

  if (!currentPlayer) return <Navigate to="/" replace />;

  return (
    <div className="min-h-dvh bg-[#F8FAFC] px-4 pt-4 pb-8">
      <div className="flex items-center gap-3 mb-6">
        <NavButton to="/parent-dashboard" />
        <h1 className="text-2xl font-bold text-[#2D2D3A]">Weekly Recap</h1>
      </div>

      {recaps.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">📊</p>
          <p className="text-[#6B6B7B] font-semibold">No recaps yet. Keep learning!</p>
          <p className="text-[#9B9BAB] text-sm mt-2">Recaps are generated at the end of each week.</p>
        </div>
      ) : (
        <div className="space-y-4 max-w-md mx-auto">
          {recaps.map((recap, i) => (
            <motion.div
              key={recap.weekKey}
              className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#E2E8F0] p-5"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#2D2D3A]">
                  Week of {new Date(recap.weekKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </h3>
                {i === 0 && (
                  <span className="text-xs bg-gradient-to-r from-coral to-[#FF8E8E] text-white rounded-full px-2.5 py-0.5 font-bold">
                    Current
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#FFF8F0] rounded-xl p-3.5 text-center border-t-[3px] border-amber-400">
                  <p className="text-2xl font-bold text-amber-600">{recap.starsEarned}</p>
                  <p className="text-xs text-[#9B9BAB] font-medium">Stars Earned</p>
                </div>
                <div className="bg-[#EDFAF8] rounded-xl p-3.5 text-center border-t-[3px] border-teal">
                  <p className="text-2xl font-bold text-teal">{recap.totalActivities}</p>
                  <p className="text-xs text-[#9B9BAB] font-medium">Activities</p>
                </div>
                <div className="bg-[#EDFAEF] rounded-xl p-3.5 text-center border-t-[3px] border-leaf">
                  <p className="text-2xl font-bold text-leaf">{recap.gamesPlayed}</p>
                  <p className="text-xs text-[#9B9BAB] font-medium">Games Played</p>
                </div>
                <div className="bg-[#F3EFFE] rounded-xl p-3.5 text-center border-t-[3px] border-grape">
                  <p className="text-2xl font-bold text-grape">{recap.storiesCompleted}</p>
                  <p className="text-xs text-[#9B9BAB] font-medium">Stories Read</p>
                </div>
              </div>

              {recap.topSkills.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-[#9B9BAB] uppercase tracking-wider mb-2">Top Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {recap.topSkills.map((skill) => {
                      const info = typeLabels[skill] ?? { label: skill, emoji: '📝' };
                      return (
                        <span key={skill} className="flex items-center gap-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-full px-3 py-1 text-xs font-medium text-[#6B6B7B]">
                          <span>{info.emoji}</span> {info.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {recap.streakDays > 0 && (
                <div className="mt-3 flex items-center gap-2 bg-[#FFF0F0] rounded-xl px-3 py-2">
                  <span className="text-lg">🔥</span>
                  <span className="text-sm font-bold text-orange-600">{recap.streakDays}-day streak!</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
