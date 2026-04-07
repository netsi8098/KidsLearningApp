import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/database';
import { useApp } from '../context/AppContext';
import { badgeData } from '../data/badgeData';
import { alphabetData } from '../data/alphabetData';
import { numbersData } from '../data/numbersData';
import { colorsData } from '../data/colorsData';
import { shapesData } from '../data/shapesData';
import { animalsData } from '../data/animalsData';
import { bodyPartsData } from '../data/bodyPartsData';
import { gamesConfig } from '../data/gamesConfig';
import NavButton from '../components/NavButton';
import { emotionsData } from '../data/emotionsData';
import SkillsProgressView from '../components/SkillsProgressView';
import IdentitySummaryCard from '../components/IdentitySummaryCard';

// Category metadata for display
const categoryConfig: Record<string, { label: string; emoji: string; total: number; color: string }> = {
  abc: { label: 'Letters', emoji: '🔤', total: alphabetData.length, color: '#FF6B6B' },
  numbers: { label: 'Numbers', emoji: '🔢', total: numbersData.length, color: '#4ECDC4' },
  colors: { label: 'Colors', emoji: '🎨', total: colorsData.length, color: '#FFB347' },
  shapes: { label: 'Shapes', emoji: '📐', total: shapesData.length, color: '#A78BFA' },
  animals: { label: 'Animals', emoji: '🐾', total: animalsData.length, color: '#6BCB77' },
  bodyparts: { label: 'Body Parts', emoji: '🦵', total: bodyPartsData.length, color: '#74B9FF' },
};

// Map game IDs to display names
const gameNames: Record<string, string> = {};
gamesConfig.forEach((g) => {
  gameNames[g.id] = g.title;
});

function getDayLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Return YYYY-MM-DD string for a date in local time */
function toDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// --- Section components ---

function OverviewCards({
  totalStars,
  streakDays,
  daysOfLearning,
  totalActivities,
}: {
  totalStars: number;
  streakDays: number;
  daysOfLearning: number;
  totalActivities: number;
}) {
  const cards = [
    { label: 'Total Stars', value: totalStars, icon: '⭐', borderColor: '#FFD93D', accent: 'text-amber-600' },
    { label: 'Streak Days', value: streakDays, icon: '🔥', borderColor: '#FF8C42', accent: 'text-orange-600' },
    { label: 'Days of Learning', value: daysOfLearning, icon: '📅', borderColor: '#4ECDC4', accent: 'text-blue-600' },
    { label: 'Total Activities', value: totalActivities, icon: '📝', borderColor: '#6BCB77', accent: 'text-green-600' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          className="bg-white rounded-[20px] p-4 shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] overflow-hidden"
          style={{ borderTop: `3px solid ${card.borderColor}` }}
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: i * 0.07 }}
        >
          <div className="text-2xl mb-1.5">{card.icon}</div>
          <div className={`text-2xl font-extrabold ${card.accent}`}>{card.value}</div>
          <div className="text-xs text-[#6B6B7B] font-medium mt-0.5">{card.label}</div>
        </motion.div>
      ))}
    </div>
  );
}

function WeeklyActivityChart({ data }: { data: { day: string; count: number; dateKey: string }[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <motion.div
      className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] p-5"
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-4">Weekly Activity</h3>
      <div className="flex items-end gap-2 h-36">
        {data.map((d, i) => {
          const height = d.count > 0 ? Math.max((d.count / maxCount) * 100, 8) : 4;
          const isToday = d.dateKey === toDateKey(new Date());
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-semibold text-gray-500">{d.count > 0 ? d.count : ''}</span>
              <motion.div
                className="w-full rounded-t-lg"
                style={{
                  height: `${height}%`,
                  backgroundColor: isToday ? '#A78BFA' : d.count > 0 ? '#4ECDC4' : '#E5E7EB',
                  minHeight: 4,
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.4 + i * 0.05, type: 'spring' }}
              />
              <span className={`text-xs font-medium ${isToday ? 'text-grape font-bold' : 'text-gray-400'}`}>
                {d.day}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function CategoryProgress({
  progressData,
}: {
  progressData: { key: string; label: string; emoji: string; learned: number; total: number; color: string }[];
}) {
  return (
    <motion.div
      className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] p-5"
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-4">Category Progress</h3>
      <div className="space-y-3">
        {progressData.map((cat) => {
          const pct = cat.total > 0 ? Math.round((cat.learned / cat.total) * 100) : 0;
          return (
            <div key={cat.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {cat.emoji} {cat.label}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {cat.learned}/{cat.total} ({pct}%)
                </span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: cat.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function RecentAchievements({
  achievements,
}: {
  achievements: { emoji: string; name: string; description: string; earnedAt: Date }[];
}) {
  if (achievements.length === 0) {
    return (
      <motion.div
        className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] p-5"
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-3">Recent Achievements</h3>
        <p className="text-sm text-[#9B9BAB] text-center py-4">No badges earned yet. Keep learning!</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] p-5"
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5 }}
    >
      <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-3">Recent Achievements</h3>
      <div className="space-y-2">
        {achievements.map((a, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-3 bg-[#FFF8F0] rounded-[14px] px-4 py-3 border border-[#F0EAE0]"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.55 + i * 0.06 }}
          >
            <span className="text-2xl">{a.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-700 truncate">{a.name}</p>
              <p className="text-xs text-gray-400">{a.description}</p>
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(a.earnedAt)}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function GamePerformance({
  avgAccuracy,
  bestScores,
}: {
  avgAccuracy: number;
  bestScores: { gameId: string; score: number; accuracy: number; stars: number }[];
}) {
  return (
    <motion.div
      className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] p-5"
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6 }}
    >
      <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-3">Game Performance</h3>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
            <path
              className="stroke-gray-100"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              strokeWidth="3"
            />
            <path
              className="stroke-teal"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              strokeWidth="3"
              strokeDasharray={`${avgAccuracy}, 100`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-700">
            {avgAccuracy}%
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Average Accuracy</p>
          <p className="text-xs text-gray-400">Across all games played</p>
        </div>
      </div>
      {bestScores.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Best Scores</p>
          {bestScores.map((s, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2">
              <span className="text-sm font-medium text-gray-700">{gameNames[s.gameId] || s.gameId}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{s.accuracy}% accuracy</span>
                <span className="text-sm font-bold text-teal">{s.score} pts</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function LearningRecommendations({
  recommendations,
}: {
  recommendations: { key: string; label: string; emoji: string; pct: number; suggestion: string }[];
}) {
  if (recommendations.length === 0) return null;

  return (
    <motion.div
      className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] p-5"
      style={{ borderLeft: '4px solid #A78BFA' }}
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.7 }}
    >
      <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-3">Recommendations</h3>
      <div className="space-y-2">
        {recommendations.map((r, i) => (
          <div key={i} className="flex items-start gap-3 bg-grape/5 rounded-xl px-3 py-2.5">
            <span className="text-xl mt-0.5">{r.emoji}</span>
            <div>
              <p className="text-sm font-semibold text-gray-700">{r.label}</p>
              <p className="text-xs text-gray-500">{r.suggestion}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// --- Main component ---

export default function ParentDashboard() {
  const navigate = useNavigate();
  const { currentPlayer } = useApp();

  // Parent gate state
  const [unlocked, setUnlocked] = useState(false);
  const [gateAnswer, setGateAnswer] = useState('');
  const [gateError, setGateError] = useState(false);
  const [num1] = useState(() => Math.floor(Math.random() * 10) + 5);
  const [num2] = useState(() => Math.floor(Math.random() * 10) + 3);
  const correctAnswer = num1 + num2;

  // Data queries - always called (hooks must not be conditional)
  const playerId = currentPlayer?.id;

  const profile = useLiveQuery(
    () => (playerId ? db.profiles.get(playerId) : undefined),
    [playerId]
  );

  const progress = useLiveQuery(
    () => (playerId ? db.progress.where('playerId').equals(playerId).toArray() : []),
    [playerId],
    []
  );

  const starRecords = useLiveQuery(
    () => (playerId ? db.stars.where('playerId').equals(playerId).toArray() : []),
    [playerId],
    []
  );

  const earnedBadges = useLiveQuery(
    () =>
      playerId
        ? db.badges.where('playerId').equals(playerId).toArray()
        : [],
    [playerId],
    []
  );

  const dailyGoals = useLiveQuery(
    () => (playerId ? db.dailyGoals.where('playerId').equals(playerId).toArray() : []),
    [playerId],
    []
  );

  const gameScores = useLiveQuery(
    () => (playerId ? db.gameScores.where('playerId').equals(playerId).toArray() : []),
    [playerId],
    []
  );

  const moodHistory = useLiveQuery(
    () =>
      playerId
        ? db.moodCheckIns
            .where('playerId')
            .equals(playerId)
            .reverse()
            .sortBy('checkedInAt')
            .then((entries) => entries.slice(0, 14))
        : [],
    [playerId],
    []
  );

  // Derived data
  const totalStars = profile?.totalStars ?? 0;
  const streakDays = profile?.streakDays ?? 0;

  const daysOfLearning = useMemo(() => {
    const uniqueDays = new Set(
      starRecords.map((r) => toDateKey(new Date(r.earnedAt)))
    );
    return uniqueDays.size;
  }, [starRecords]);

  const totalActivities = progress.length;

  // Weekly chart data
  const weeklyData = useMemo(() => {
    const days: { day: string; count: number; dateKey: string }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = toDateKey(d);
      const dayLabel = getDayLabel(d);

      // Check dailyGoals first
      const dailyGoal = dailyGoals.find((dg) => dg.date === dateKey);
      let count = 0;
      if (dailyGoal) {
        count = dailyGoal.lessonsCompleted + dailyGoal.gamesPlayed + dailyGoal.storiesRead + dailyGoal.videosWatched;
      } else {
        // Fall back to counting star records for that date
        count = starRecords.filter((r) => toDateKey(new Date(r.earnedAt)) === dateKey).length;
      }

      days.push({ day: dayLabel, count, dateKey });
    }
    return days;
  }, [dailyGoals, starRecords]);

  // Category progress
  const categoryProgressData = useMemo(() => {
    return Object.entries(categoryConfig).map(([key, cfg]) => {
      const learned = progress.filter((p) => p.category === key && p.timesCompleted > 0).length;
      return { key, label: cfg.label, emoji: cfg.emoji, learned, total: cfg.total, color: cfg.color };
    });
  }, [progress]);

  // Recent achievements
  const recentAchievements = useMemo(() => {
    const sorted = [...earnedBadges].sort(
      (a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
    );
    return sorted.slice(0, 5).map((eb) => {
      const def = badgeData.find((bd) => bd.id === eb.badgeId);
      return {
        emoji: def?.emoji ?? '🏅',
        name: def?.name ?? eb.badgeId,
        description: def?.description ?? '',
        earnedAt: new Date(eb.earnedAt),
      };
    });
  }, [earnedBadges]);

  // Game performance
  const gamePerf = useMemo(() => {
    if (gameScores.length === 0) return null;

    const avgAccuracy = Math.round(
      gameScores.reduce((sum, gs) => sum + gs.accuracy, 0) / gameScores.length
    );

    // Best score per game
    const bestMap = new Map<string, typeof gameScores[0]>();
    for (const gs of gameScores) {
      const current = bestMap.get(gs.gameId);
      if (!current || gs.score > current.score) {
        bestMap.set(gs.gameId, gs);
      }
    }
    const bestScores = Array.from(bestMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((gs) => ({
        gameId: gs.gameId,
        score: gs.score,
        accuracy: Math.round(gs.accuracy),
        stars: gs.stars,
      }));

    return { avgAccuracy, bestScores };
  }, [gameScores]);

  // Learning recommendations
  const recommendations = useMemo(() => {
    const catProgress = Object.entries(categoryConfig).map(([key, cfg]) => {
      const learned = progress.filter((p) => p.category === key && p.timesCompleted > 0).length;
      const pct = cfg.total > 0 ? Math.round((learned / cfg.total) * 100) : 0;
      return { key, label: cfg.label, emoji: cfg.emoji, pct, total: cfg.total, learned };
    });

    // Sort by lowest percentage first
    const sorted = [...catProgress].sort((a, b) => a.pct - b.pct);

    // Take the bottom 3 that aren't complete
    return sorted
      .filter((c) => c.pct < 100)
      .slice(0, 3)
      .map((c) => {
        let suggestion: string;
        if (c.learned === 0) {
          suggestion = `Your child hasn't started ${c.label.toLowerCase()} yet. This is a great area to explore!`;
        } else if (c.pct < 50) {
          suggestion = `${c.learned} of ${c.total} completed. Encourage more practice in ${c.label.toLowerCase()}.`;
        } else {
          suggestion = `Almost there! Only ${c.total - c.learned} more ${c.label.toLowerCase()} to finish.`;
        }
        return { key: c.key, label: c.label, emoji: c.emoji, pct: c.pct, suggestion };
      });
  }, [progress]);

  // --- Guard: no player ---
  if (!currentPlayer) return <Navigate to="/" replace />;

  // --- Parent gate ---
  function handleGateSubmit() {
    if (parseInt(gateAnswer) === correctAnswer) {
      setUnlocked(true);
    } else {
      setGateAnswer('');
      setGateError(true);
      setTimeout(() => setGateError(false), 2000);
    }
  }

  if (!unlocked) {
    return (
      <div className="min-h-dvh bg-[#FFF8F0] p-4 flex flex-col items-center justify-center">
        <motion.div className="text-7xl mb-5 drop-shadow-md" initial={{ scale: 0 }} animate={{ scale: 1 }}>
          📊
        </motion.div>
        <h2 className="text-2xl font-extrabold text-[#2D2D3A] mb-2">Parent Dashboard</h2>
        <p className="text-[15px] font-medium text-[#6B6B7B] mb-6 text-center">Solve this to view your child&apos;s progress</p>
        <motion.div
          className="bg-white rounded-[20px] p-6 shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] text-center max-w-xs w-full"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <p className="text-3xl font-extrabold text-[#2D2D3A] mb-4">
            {num1} + {num2} = ?
          </p>
          <input
            type="number"
            value={gateAnswer}
            onChange={(e) => setGateAnswer(e.target.value)}
            placeholder="Answer"
            className="w-full bg-[#FFF8F0] rounded-[14px] px-4 py-3 text-2xl text-center font-bold outline-none focus:ring-4 focus:ring-grape/20 focus:border-grape/30 border border-[#F0EAE0] mb-4 transition-all"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleGateSubmit()}
          />
          {gateError && (
            <p className="text-coral font-bold text-sm mb-3">That&apos;s not right. Try again!</p>
          )}
          <div className="flex gap-3">
            <motion.button
              className="flex-1 bg-white/80 backdrop-blur-sm rounded-[14px] py-3 font-bold cursor-pointer text-[#6B6B7B] shadow-sm border border-[#F0EAE0]"
              onClick={() => navigate('/menu')}
              whileTap={{ scale: 0.95 }}
            >
              Back
            </motion.button>
            <motion.button
              className="flex-1 bg-gradient-to-r from-grape to-indigo-400 text-white rounded-[14px] py-3 font-bold cursor-pointer shadow-[0_4px_20px_rgba(167,139,250,0.25)]"
              onClick={handleGateSubmit}
              whileTap={{ scale: 0.95 }}
            >
              Check
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- Dashboard ---
  return (
    <div className="min-h-dvh bg-[#FFF8F0] px-4 pt-4 pb-24 md:px-8 md:pt-6 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:max-w-3xl md:mx-auto">
        <NavButton onClick={() => navigate('/menu')} direction="back" />
        <h2 className="text-lg md:text-xl font-extrabold text-[#2D2D3A]">
          {currentPlayer.avatarEmoji} {currentPlayer.name}&apos;s Progress
        </h2>
        <div className="w-14" />
      </div>

      <div className="max-w-lg mx-auto md:max-w-3xl space-y-4 md:space-y-6">
        {/* Player Identity Summary */}
        <IdentitySummaryCard
          name={currentPlayer.name}
          emoji={currentPlayer.avatarEmoji}
          color="#A78BFA"
          age={currentPlayer.age}
          totalStars={totalStars}
          lastPlayedAt={currentPlayer.lastPlayedAt}
        />

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3 mt-4 md:grid-cols-3 md:gap-4">
          <button
            onClick={() => navigate('/inbox')}
            className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] p-4 flex flex-col items-center gap-2 hover:shadow-[0_8px_24px_rgba(45,45,58,0.10)] transition-shadow duration-200"
          >
            <span className="text-3xl">📬</span>
            <span className="font-bold text-[#2D2D3A] text-sm">Inbox</span>
          </button>
          <button
            onClick={() => navigate('/routines')}
            className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] p-4 flex flex-col items-center gap-2 hover:shadow-[0_8px_24px_rgba(45,45,58,0.10)] transition-shadow duration-200"
          >
            <span className="text-3xl">📋</span>
            <span className="font-bold text-[#2D2D3A] text-sm">Routines</span>
          </button>
        </div>

        {/* 1. Overview Cards */}
        <OverviewCards
          totalStars={totalStars}
          streakDays={streakDays}
          daysOfLearning={daysOfLearning}
          totalActivities={totalActivities}
        />

        {/* 2. Weekly Activity Chart */}
        <WeeklyActivityChart data={weeklyData} />

        {/* 3. Category Progress */}
        <CategoryProgress progressData={categoryProgressData} />

        {/* 4. Recent Achievements */}
        <RecentAchievements achievements={recentAchievements} />

        {/* 5. Game Performance (conditional) */}
        {gamePerf && (
          <GamePerformance avgAccuracy={gamePerf.avgAccuracy} bestScores={gamePerf.bestScores} />
        )}

        {/* 6. Mood History */}
        {moodHistory.length > 0 && (
          <motion.div
            className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(45,45,58,0.06)] border border-[#F0EAE0] p-5"
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.65 }}
          >
            <h3 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-3">Recent Mood Check-ins</h3>
            <div className="space-y-2">
              {moodHistory.map((entry, i) => {
                const emotion = emotionsData.find((e) => e.key === entry.mood);
                return (
                  <motion.div
                    key={entry.id ?? i}
                    className="flex items-center gap-3 bg-[#FFF8F0] rounded-[14px] px-4 py-3 border border-[#F0EAE0]"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.7 + i * 0.04 }}
                  >
                    <span className="text-2xl">{emotion?.emoji ?? '😶'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-700">{emotion?.label ?? entry.mood}</p>
                      {entry.note && <p className="text-xs text-gray-400 truncate">{entry.note}</p>}
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(new Date(entry.checkedInAt))}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* 7. Skills Progress View */}
        {playerId && (
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <SkillsProgressView playerId={playerId} />
          </motion.div>
        )}

        {/* 8. Weekly Recap Link */}
        <motion.button
          className="w-full bg-gradient-to-r from-grape to-indigo-500 rounded-[20px] p-5 text-left text-white shadow-[0_4px_20px_rgba(167,139,250,0.25)] cursor-pointer"
          onClick={() => navigate('/weekly-recap')}
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.75 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <div>
              <p className="font-bold text-sm">Weekly Recap</p>
              <p className="text-white/70 text-xs">See detailed learning reports</p>
            </div>
            <span className="text-white text-xl ml-auto">→</span>
          </div>
        </motion.button>

        {/* 9. Learning Recommendations */}
        <LearningRecommendations recommendations={recommendations} />

        {/* Footer note */}
        <motion.p
          className="text-center text-xs text-gray-400 pt-2 pb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Data updates in real-time as your child plays.
        </motion.p>
      </div>
    </div>
  );
}
