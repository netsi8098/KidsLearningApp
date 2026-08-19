/**
 * SearchBar — universal search for the app.
 * Searches across stories, lessons, videos, activities.
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { storiesData } from '../data/storiesData';
import { lessonsData } from '../data/lessonsData';
import { playableVideos } from '../data/videoConfig';
import { SearchIcon } from './svg/CommonIcons';

interface SearchResult {
  id: string;
  title: string;
  type: 'story' | 'lesson' | 'video' | 'activity';
  route: string;
  color: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();

  const results = useMemo<SearchResult[]>(() => {
    if (query.trim().length < 2) return [];
    const q = query.toLowerCase();

    const matches: SearchResult[] = [];

    // Search stories
    for (const s of storiesData) {
      if (s.title.toLowerCase().includes(q)) {
        matches.push({ id: s.id, title: s.title, type: 'story', route: '/stories', color: '#A78BFA' });
      }
    }

    // Search lessons
    for (const l of lessonsData) {
      if (l.title.toLowerCase().includes(q)) {
        matches.push({ id: l.id, title: l.title, type: 'lesson', route: '/lessons', color: '#FF6B6B' });
      }
    }

    // Search videos
    for (const v of playableVideos) {
      if (v.title.toLowerCase().includes(q)) {
        matches.push({ id: v.id, title: v.title, type: 'video', route: '/videos', color: '#4ECDC4' });
      }
    }

    // Static activities
    const activities = [
      { title: 'ABCs', route: '/abc' }, { title: 'Numbers', route: '/numbers' },
      { title: 'Colors', route: '/colors' }, { title: 'Shapes', route: '/shapes' },
      { title: 'Animals', route: '/animals' }, { title: 'Quiz', route: '/quiz' },
      { title: 'Coloring', route: '/coloring' }, { title: 'Games', route: '/games' },
    ];
    for (const a of activities) {
      if (a.title.toLowerCase().includes(q)) {
        matches.push({ id: a.route, title: a.title, type: 'activity', route: a.route, color: '#FF8C42' });
      }
    }

    return matches.slice(0, 8);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    setQuery('');
    setFocused(false);
    navigate(result.route);
  };

  return (
    <div className="relative">
      <div
        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all"
        style={{
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(8px)',
          border: focused ? '2px solid #4ECDC4' : '2px solid transparent',
          boxShadow: focused ? '0 4px 16px rgba(78,205,196,0.2)' : '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <SearchIcon size={18} />
        <input
          type="text"
          placeholder="Search activities, stories, videos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          className="flex-1 bg-transparent outline-none text-sm font-bold text-[#2D2D3A] placeholder:text-[#9B9BAB] placeholder:font-medium"
        />
      </div>

      {/* Results dropdown */}
      <AnimatePresence>
        {focused && results.length > 0 && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden"
            style={{ background: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 50 }}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {results.map((r) => (
              <button
                key={r.id}
                className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer hover:bg-[#F5F0E8] transition-colors"
                onMouseDown={() => handleSelect(r)}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-display text-xs text-white"
                  style={{ background: r.color }}
                >
                  {r.type === 'story' ? 'S' : r.type === 'lesson' ? 'L' : r.type === 'video' ? 'V' : 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#2D2D3A] truncate">{r.title}</p>
                  <p className="text-[10px] text-[#9B9BAB] font-bold uppercase">{r.type}</p>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
