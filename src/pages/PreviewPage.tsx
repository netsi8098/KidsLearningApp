import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { contentRegistry } from '../registry/contentRegistry';
import { getTagsForContent } from '../registry/tagsConfig';
import { getSkillsForContent } from '../registry/skillsConfig';
import { getContentBadges } from '../registry/releaseConfig';
import { getAccessTier } from '../registry/accessConfig';
import NavButton from '../components/NavButton';
import type { ContentType } from '../registry/types';

const contentTypes: ContentType[] = [
  'alphabet', 'number', 'color', 'shape', 'animal', 'bodypart',
  'lesson', 'story', 'video', 'game', 'audio', 'cooking',
  'movement', 'homeactivity', 'explorer', 'lifeskill', 'coloring', 'emotion',
];

export default function PreviewPage() {
  const { currentPlayer } = useApp();
  const [filterType, setFilterType] = useState<string>('');
  const [filterTag, setFilterTag] = useState('');

  // Parent gate (simplified — requires current player)
  if (!currentPlayer) return <Navigate to="/" replace />;

  let items = contentRegistry;

  if (filterType) {
    items = items.filter((item) => item.type === filterType);
  }

  if (filterTag) {
    const q = filterTag.toLowerCase();
    items = items.filter((item) => {
      const tags = getTagsForContent(item.id);
      return tags.some((t) => t.toLowerCase().includes(q));
    });
  }

  return (
    <div className="min-h-dvh bg-[#F8FAFC] px-4 pt-4 pb-8">
      <div className="flex items-center gap-3 mb-4">
        <NavButton to="/settings" />
        <h1 className="text-xl font-bold text-[#2D2D3A]">Content Preview</h1>
        <span className="ml-auto text-xs bg-[#E2E8F0] text-[#6B6B7B] rounded-full px-2.5 py-0.5 font-medium">
          {items.length} items
        </span>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 snap-x">
        <button
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap snap-start transition-colors ${!filterType ? 'bg-gradient-to-r from-coral to-[#FF8E8E] text-white shadow-[0_2px_8px_rgba(255,107,107,0.3)]' : 'bg-white text-[#6B6B7B] border border-[#E2E8F0]'}`}
          onClick={() => setFilterType('')}
        >
          All
        </button>
        {contentTypes.map((type) => (
          <button
            key={type}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap capitalize snap-start transition-colors ${filterType === type ? 'bg-gradient-to-r from-coral to-[#FF8E8E] text-white shadow-[0_2px_8px_rgba(255,107,107,0.3)]' : 'bg-white text-[#6B6B7B] border border-[#E2E8F0]'}`}
            onClick={() => setFilterType(type)}
          >
            {type}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={filterTag}
        onChange={(e) => setFilterTag(e.target.value)}
        placeholder="Filter by tag..."
        className="w-full bg-white rounded-xl px-4 py-2.5 text-sm shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#E2E8F0] mb-4 outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral/30"
      />

      {/* Content List */}
      <div className="space-y-2.5 max-w-lg mx-auto">
        {items.slice(0, 100).map((item) => {
          const tags = getTagsForContent(item.id);
          const skills = getSkillsForContent(item.id);
          const badges = getContentBadges(item.id);
          const access = getAccessTier(item.id);

          return (
            <motion.div
              key={item.id}
              className="bg-white rounded-xl p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.06)] border border-[#E2E8F0]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-start gap-2.5">
                <span className="text-xl">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-[#2D2D3A] truncate">{item.title}</p>
                    {access === 'premium' && <span className="text-xs bg-amber-50 text-amber-700 rounded-md px-1.5 py-0.5 font-medium border border-amber-200">Premium</span>}
                    {badges.map((b) => (
                      <span key={b} className="text-[10px] bg-[#FFF0F0] text-coral rounded-md px-1.5 py-0.5 capitalize font-medium">{b}</span>
                    ))}
                  </div>
                  <p className="text-[10px] text-[#9B9BAB] mt-0.5">
                    {item.id} | {item.type} | {item.category ?? 'none'} | {item.ageGroup ?? 'all'}
                    {item.durationMinutes ? ` | ${item.durationMinutes}min` : ''}
                  </p>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {tags.map((tag) => (
                        <span key={tag} className="text-[9px] bg-[#F8FAFC] text-[#6B6B7B] rounded-md px-1.5 py-0.5 border border-[#E2E8F0]">{tag}</span>
                      ))}
                    </div>
                  )}
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {skills.map((skill) => (
                        <span key={skill} className="text-[9px] bg-[#EDFAF8] text-teal rounded-md px-1.5 py-0.5 font-medium">{skill}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
        {items.length > 100 && (
          <p className="text-center text-xs text-[#9B9BAB] py-4">
            Showing first 100 of {items.length} items
          </p>
        )}
      </div>
    </div>
  );
}
