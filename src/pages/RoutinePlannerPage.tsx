import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useRoutines, type RoutineTemplate } from '../hooks/useRoutines';
import type { Routine, RoutineItem } from '../db/database';
import RoutineBuilder from '../components/RoutineBuilder';
import NavButton from '../components/NavButton';

const routineTypeConfig: Record<string, { emoji: string; color: string }> = {
  morning: { emoji: '🌅', color: 'bg-sunny/10' },
  after_school: { emoji: '🏠', color: 'bg-teal/10' },
  travel: { emoji: '🚗', color: 'bg-grape/10' },
  bedtime: { emoji: '🌙', color: 'bg-indigo-100' },
  weekend: { emoji: '🎉', color: 'bg-coral/10' },
  custom: { emoji: '✨', color: 'bg-leaf/10' },
};

const dayOptions = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const typeOptions: { key: Routine['type']; label: string; emoji: string }[] = [
  { key: 'morning', label: 'Morning', emoji: '🌅' },
  { key: 'after_school', label: 'After School', emoji: '🏠' },
  { key: 'travel', label: 'Travel', emoji: '🚗' },
  { key: 'bedtime', label: 'Bedtime', emoji: '🌙' },
  { key: 'weekend', label: 'Weekend', emoji: '🎉' },
  { key: 'custom', label: 'Custom', emoji: '✨' },
];

const availableContentItems = [
  { contentId: 'abc-practice', title: 'Letter Practice', emoji: '🔤', durationMinutes: 10 },
  { contentId: 'numbers-counting', title: 'Counting Practice', emoji: '🔢', durationMinutes: 10 },
  { contentId: 'colors-learn', title: 'Learn Colors', emoji: '🎨', durationMinutes: 8 },
  { contentId: 'shapes-learn', title: 'Learn Shapes', emoji: '🔷', durationMinutes: 8 },
  { contentId: 'animals-explore', title: 'Animal Explorer', emoji: '🐾', durationMinutes: 10 },
  { contentId: 'story-time', title: 'Story Time', emoji: '📖', durationMinutes: 10 },
  { contentId: 'game-matching', title: 'Matching Game', emoji: '🃏', durationMinutes: 10 },
  { contentId: 'game-quiz', title: 'Fun Quiz', emoji: '🧠', durationMinutes: 10 },
  { contentId: 'movement-stretch', title: 'Morning Stretch', emoji: '🧘', durationMinutes: 5 },
  { contentId: 'movement-dance', title: 'Dance Break', emoji: '💃', durationMinutes: 5 },
  { contentId: 'movement-yoga', title: 'Yoga for Kids', emoji: '🧘', durationMinutes: 10 },
  { contentId: 'coloring-free', title: 'Creative Coloring', emoji: '🎨', durationMinutes: 10 },
  { contentId: 'cooking-recipe', title: 'Cooking Adventure', emoji: '🍳', durationMinutes: 15 },
  { contentId: 'audio-music', title: 'Sing Along', emoji: '🎵', durationMinutes: 10 },
  { contentId: 'audio-story', title: 'Listen to a Story', emoji: '🎧', durationMinutes: 10 },
  { contentId: 'audio-lullaby', title: 'Calm Sounds', emoji: '🎶', durationMinutes: 5 },
  { contentId: 'breathing-calm', title: 'Breathing Exercise', emoji: '🌬️', durationMinutes: 5 },
  { contentId: 'story-bedtime', title: 'Bedtime Story', emoji: '📖', durationMinutes: 10 },
  { contentId: 'explorer-animals', title: 'Animal Facts', emoji: '🐾', durationMinutes: 10 },
  { contentId: 'abc-songs', title: 'ABC Songs', emoji: '🎵', durationMinutes: 5 },
  { contentId: 'colors-quiz', title: 'Color Quiz', emoji: '🌈', durationMinutes: 10 },
  { contentId: 'game-shapes', title: 'Shape Spotter', emoji: '🔷', durationMinutes: 10 },
];

export default function RoutinePlannerPage() {
  const navigate = useNavigate();
  const { currentPlayer } = useApp();
  const { routines, createRoutine, deleteRoutine, templates, createFromTemplate } = useRoutines();

  // Parent gate
  const [unlocked, setUnlocked] = useState(false);
  const [gateAnswer, setGateAnswer] = useState('');
  const [gateError, setGateError] = useState(false);
  const [num1] = useState(() => Math.floor(Math.random() * 10) + 5);
  const [num2] = useState(() => Math.floor(Math.random() * 10) + 3);
  const correctAnswer = num1 + num2;

  // Builder state
  const [showBuilder, setShowBuilder] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [builderName, setBuilderName] = useState('');
  const [builderType, setBuilderType] = useState<Routine['type']>('morning');
  const [builderDays, setBuilderDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [builderTime, setBuilderTime] = useState('09:00');
  const [builderItems, setBuilderItems] = useState<RoutineItem[]>([]);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<number | null>(null);

  if (!currentPlayer) return <Navigate to="/" replace />;

  function handleGateSubmit() {
    if (parseInt(gateAnswer) === correctAnswer) {
      setUnlocked(true);
    } else {
      setGateAnswer('');
      setGateError(true);
      setTimeout(() => setGateError(false), 2000);
    }
  }

  function resetBuilder() {
    setBuilderName('');
    setBuilderType('morning');
    setBuilderDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
    setBuilderTime('09:00');
    setBuilderItems([]);
    setShowPicker(false);
  }

  async function handleCreate() {
    if (!builderName.trim() || builderItems.length === 0) return;
    const totalMinutes = builderItems.reduce((s, i) => s + i.durationMinutes, 0);
    await createRoutine({
      name: builderName.trim(),
      type: builderType,
      days: builderDays,
      time: builderTime,
      estimatedMinutes: totalMinutes,
      items: builderItems,
    });
    resetBuilder();
    setShowBuilder(false);
  }

  async function handleUseTemplate(template: RoutineTemplate) {
    await createFromTemplate(template);
    setShowTemplates(false);
  }

  function toggleDay(day: string) {
    setBuilderDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function handleDelete(id: number) {
    await deleteRoutine(id);
    setDeleteId(null);
  }

  if (!unlocked) {
    return (
      <div className="min-h-dvh bg-[#F8FAFC] px-4 pt-4 pb-8 flex flex-col items-center justify-center">
        <motion.div className="text-6xl mb-4" initial={{ scale: 0 }} animate={{ scale: 1 }}>
          📋
        </motion.div>
        <h2 className="text-2xl font-bold text-[#2D2D3A] mb-2">Routine Planner</h2>
        <p className="text-[#6B6B7B] mb-6 text-center">Solve this to manage routines</p>
        <motion.div
          className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#E2E8F0] text-center max-w-xs w-full"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <p className="text-3xl font-bold text-[#2D2D3A] mb-4">
            {num1} + {num2} = ?
          </p>
          <input
            type="number"
            value={gateAnswer}
            onChange={(e) => setGateAnswer(e.target.value)}
            placeholder="Answer"
            className="w-full bg-[#F8FAFC] rounded-xl px-4 py-3 text-2xl text-center font-bold outline-none focus:ring-4 focus:ring-grape/20 border border-[#E2E8F0] mb-4"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleGateSubmit()}
          />
          {gateError && (
            <p className="text-coral font-bold text-sm mb-3">That&apos;s not right. Try again!</p>
          )}
          <div className="flex gap-3">
            <motion.button
              className="flex-1 bg-[#F1F5F9] text-[#6B6B7B] rounded-xl py-3 font-bold cursor-pointer"
              onClick={() => navigate(-1)}
              whileTap={{ scale: 0.95 }}
            >
              Back
            </motion.button>
            <motion.button
              className="flex-1 bg-grape text-white rounded-xl py-3 font-bold cursor-pointer"
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

  return (
    <div className="min-h-dvh bg-[#F8FAFC] px-4 pt-4 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <NavButton onClick={() => navigate(-1)} direction="back" />
        <h2 className="text-xl font-bold text-[#2D2D3A]">Routines</h2>
        <div className="w-14" />
      </div>

      <div className="max-w-md mx-auto space-y-4">
        {/* Action buttons */}
        <motion.div
          className="flex gap-2"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <motion.button
            className="flex-1 bg-gradient-to-r from-coral to-[#FF8E8E] text-white font-bold py-3 rounded-[14px] text-sm cursor-pointer shadow-[0_2px_8px_rgba(255,107,107,0.3)]"
            onClick={() => { resetBuilder(); setShowBuilder(true); }}
            whileTap={{ scale: 0.95 }}
          >
            + Create Routine
          </motion.button>
          <motion.button
            className="flex-1 bg-white text-grape font-bold py-3 rounded-[14px] text-sm cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#E2E8F0]"
            onClick={() => setShowTemplates(true)}
            whileTap={{ scale: 0.95 }}
          >
            📋 Templates
          </motion.button>
        </motion.div>

        {/* Existing routines list */}
        {routines.length === 0 && !showBuilder && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="text-6xl block mb-4">📋</span>
            <p className="font-bold text-lg text-[#2D2D3A]">No routines yet</p>
            <p className="text-sm text-[#9B9BAB] mt-1">Create a routine or start from a template</p>
          </motion.div>
        )}

        {routines.map((routine, i) => {
          const typeConf = routineTypeConfig[routine.type] ?? routineTypeConfig.custom;
          return (
            <motion.div
              key={routine.id}
              className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#E2E8F0] p-5"
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center text-xl ${typeConf.color}`}>
                  {typeConf.emoji}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[#2D2D3A]">{routine.name}</p>
                  <div className="flex items-center gap-2 text-xs text-[#9B9BAB]">
                    <span>{routine.time}</span>
                    <span className="text-[#E2E8F0]">|</span>
                    <span>{routine.estimatedMinutes} min</span>
                    <span className="text-[#E2E8F0]">|</span>
                    <span>{routine.items.length} activities</span>
                  </div>
                </div>
              </div>

              {/* Days */}
              <div className="flex gap-1 mb-3">
                {dayOptions.map((day) => (
                  <span
                    key={day}
                    className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${
                      routine.days.includes(day)
                        ? 'bg-[#EDFAF8] text-teal'
                        : 'bg-[#F8FAFC] text-[#E2E8F0]'
                    }`}
                  >
                    {day}
                  </span>
                ))}
              </div>

              {/* Items preview */}
              <div className="flex gap-1.5 flex-wrap mb-3">
                {routine.items.slice(0, 4).map((item, idx) => (
                  <span
                    key={idx}
                    className="text-sm bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2 py-1 flex items-center gap-1"
                  >
                    <span>{item.emoji}</span>
                    <span className="text-xs text-[#6B6B7B]">{item.title}</span>
                  </span>
                ))}
                {routine.items.length > 4 && (
                  <span className="text-xs text-[#9B9BAB] self-center">
                    +{routine.items.length - 4} more
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <motion.button
                  className="flex-1 bg-teal text-white font-bold py-2.5 rounded-xl text-sm cursor-pointer shadow-[0_2px_8px_rgba(78,205,196,0.3)]"
                  onClick={() => navigate(`/routines/${routine.id}/play`)}
                  whileTap={{ scale: 0.95 }}
                >
                  ▶ Start
                </motion.button>
                <motion.button
                  className="bg-[#FFF0F0] text-coral font-bold py-2.5 px-4 rounded-xl text-sm cursor-pointer"
                  onClick={() => setDeleteId(routine.id!)}
                  whileTap={{ scale: 0.95 }}
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          );
        })}

        {/* Builder modal */}
        <AnimatePresence>
          {showBuilder && (
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-end justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBuilder(false)}
            >
              <motion.div
                className="bg-[#F8FAFC] rounded-t-[24px] w-full max-w-md max-h-[90vh] overflow-y-auto p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-10 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-5" />
                <h3 className="font-bold text-lg text-[#2D2D3A] mb-4">Create Routine</h3>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="text-sm font-semibold text-[#6B6B7B] mb-1 block">Name</label>
                    <input
                      type="text"
                      value={builderName}
                      onChange={(e) => setBuilderName(e.target.value)}
                      placeholder="My Morning Routine"
                      maxLength={30}
                      className="w-full bg-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-grape/15 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#E2E8F0] text-[#2D2D3A] placeholder:text-[#9B9BAB]"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="text-sm font-semibold text-[#6B6B7B] mb-2 block">Type</label>
                    <div className="flex flex-wrap gap-2">
                      {typeOptions.map((opt) => (
                        <motion.button
                          key={opt.key}
                          className={`px-3 py-1.5 rounded-full flex items-center gap-1 font-bold text-xs cursor-pointer transition-colors ${
                            builderType === opt.key
                              ? 'bg-grape text-white shadow-[0_2px_8px_rgba(167,139,250,0.3)]'
                              : 'bg-white text-[#6B6B7B] border border-[#E2E8F0]'
                          }`}
                          onClick={() => setBuilderType(opt.key)}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span>{opt.emoji}</span>
                          <span>{opt.label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Days */}
                  <div>
                    <label className="text-sm font-semibold text-[#6B6B7B] mb-2 block">Days</label>
                    <div className="flex gap-2">
                      {dayOptions.map((day) => (
                        <motion.button
                          key={day}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                            builderDays.includes(day)
                              ? 'bg-teal text-white shadow-[0_2px_8px_rgba(78,205,196,0.3)]'
                              : 'bg-white text-[#9B9BAB] border border-[#E2E8F0]'
                          }`}
                          onClick={() => toggleDay(day)}
                          whileTap={{ scale: 0.95 }}
                        >
                          {day}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Time */}
                  <div>
                    <label className="text-sm font-semibold text-[#6B6B7B] mb-1 block">Time</label>
                    <input
                      type="time"
                      value={builderTime}
                      onChange={(e) => setBuilderTime(e.target.value)}
                      className="w-full bg-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-grape/15 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#E2E8F0] text-[#2D2D3A]"
                    />
                  </div>

                  {/* Activities */}
                  <div>
                    <label className="text-sm font-semibold text-[#6B6B7B] mb-2 block">Activities</label>
                    <RoutineBuilder
                      items={builderItems}
                      onItemsChange={setBuilderItems}
                      availableContent={availableContentItems}
                      showPicker={showPicker}
                      onTogglePicker={() => setShowPicker(!showPicker)}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <motion.button
                      className="flex-1 bg-[#F1F5F9] text-[#6B6B7B] rounded-xl py-3 font-bold text-sm cursor-pointer"
                      onClick={() => setShowBuilder(false)}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      className="flex-1 bg-gradient-to-r from-coral to-[#FF8E8E] text-white rounded-xl py-3 font-bold text-sm cursor-pointer disabled:opacity-40"
                      onClick={handleCreate}
                      disabled={!builderName.trim() || builderItems.length === 0}
                      whileTap={{ scale: 0.95 }}
                    >
                      Create Routine
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Templates modal */}
        <AnimatePresence>
          {showTemplates && (
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-end justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTemplates(false)}
            >
              <motion.div
                className="bg-white rounded-t-[24px] w-full max-w-md max-h-[80vh] overflow-y-auto p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-10 h-1 bg-[#E2E8F0] rounded-full mx-auto mb-5" />
                <h3 className="font-bold text-lg text-[#2D2D3A] mb-4">Routine Templates</h3>

                <div className="space-y-3">
                  {templates.map((template, i) => {
                    const typeConf = routineTypeConfig[template.type] ?? routineTypeConfig.custom;
                    return (
                      <motion.div
                        key={template.name}
                        className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]"
                        initial={{ y: 5, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${typeConf.color}`}>
                            {template.emoji}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-sm text-[#2D2D3A]">{template.name}</p>
                            <p className="text-xs text-[#9B9BAB]">{template.estimatedMinutes} min | {template.items.length} activities</p>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-wrap mb-3">
                          {template.items.map((item, idx) => (
                            <span key={idx} className="text-xs bg-white rounded-lg px-2 py-0.5 flex items-center gap-1 shadow-[0_1px_2px_rgba(0,0,0,0.04)] border border-[#E2E8F0]">
                              <span>{item.emoji}</span>
                              <span className="text-[#6B6B7B]">{item.title}</span>
                            </span>
                          ))}
                        </div>
                        <motion.button
                          className="w-full bg-teal text-white font-bold py-2 rounded-xl text-sm cursor-pointer shadow-[0_2px_8px_rgba(78,205,196,0.3)]"
                          onClick={() => handleUseTemplate(template)}
                          whileTap={{ scale: 0.95 }}
                        >
                          Use This Template
                        </motion.button>
                      </motion.div>
                    );
                  })}
                </div>

                <motion.button
                  className="w-full mt-4 bg-[#F1F5F9] text-[#6B6B7B] font-bold py-3 rounded-xl text-sm cursor-pointer"
                  onClick={() => setShowTemplates(false)}
                  whileTap={{ scale: 0.95 }}
                >
                  Close
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete confirmation */}
        <AnimatePresence>
          {deleteId !== null && (
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteId(null)}
            >
              <motion.div
                className="bg-white rounded-xl p-6 max-w-sm w-full shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#E2E8F0]"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-4xl text-center mb-3">🗑️</p>
                <h3 className="font-bold text-lg text-[#2D2D3A] text-center mb-2">Delete Routine?</h3>
                <p className="text-sm text-[#6B6B7B] text-center mb-4">
                  This will permanently remove this routine.
                </p>
                <div className="flex gap-3">
                  <motion.button
                    className="flex-1 bg-[#F1F5F9] text-[#6B6B7B] rounded-xl py-3 font-bold text-sm cursor-pointer"
                    onClick={() => setDeleteId(null)}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    className="flex-1 bg-coral text-white rounded-xl py-3 font-bold text-sm cursor-pointer"
                    onClick={() => handleDelete(deleteId)}
                    whileTap={{ scale: 0.95 }}
                  >
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
