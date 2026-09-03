/**
 * ThemePicker — carousel/modal for selecting a homepage world.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { themes, type HomepageTheme } from '../../data/homepageThemes';

interface ThemePickerProps {
  open: boolean;
  onClose: () => void;
  activeThemeId: string;
  onSelect: (themeId: string) => void;
}

export default function ThemePicker({ open, onClose, activeThemeId, onSelect }: ThemePickerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl"
            style={{ background: 'linear-gradient(180deg, #2D2D3A 0%, #1F1F2E 100%)', maxWidth: 500, margin: '0 auto' }}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-white/20" /></div>
            <div className="px-5 pb-6">
              <h3 className="text-white font-display text-lg mb-1">Choose Your World</h3>
              <p className="text-white/40 text-xs font-bold mb-4">Pick a homepage world for your adventure!</p>

              <div className="grid grid-cols-2 gap-3">
                {themes.map((t) => (
                  <ThemeCard
                    key={t.id}
                    theme={t}
                    active={activeThemeId === t.id}
                    onSelect={() => { onSelect(t.id); onClose(); }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ThemeCard({ theme, active, onSelect }: { theme: HomepageTheme; active: boolean; onSelect: () => void }) {
  return (
    <motion.button
      className="rounded-2xl overflow-hidden text-left cursor-pointer"
      style={{
        border: active ? '2.5px solid white' : '2px solid rgba(255,255,255,0.1)',
        boxShadow: active ? '0 0 0 3px rgba(255,255,255,0.2), 0 4px 16px rgba(0,0,0,0.2)' : '0 2px 8px rgba(0,0,0,0.1)',
      }}
      onClick={onSelect}
      whileTap={{ scale: 0.96 }}
    >
      {/* Preview gradient */}
      <div
        className="h-20 relative"
        style={{
          background: theme.previewImage
            ? `url(${theme.previewImage}) center 58% / cover no-repeat`
            : `linear-gradient(135deg, ${theme.skyGradient[0]}, ${theme.skyGradient[1]})`,
        }}
      >
        {/* Ground preview */}
        {!theme.previewImage && (
          <div className="absolute bottom-0 left-0 right-0 h-8" style={{ background: `linear-gradient(180deg, ${theme.groundGradient[0]}80, ${theme.groundGradient[1]})`, borderRadius: '40% 40% 0 0' }} />
        )}
        {/* Active badge */}
        {active && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 12 12"><path d="M2 6L5 9L10 3" stroke="#6BCB77" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
          </div>
        )}
      </div>
      <div className="px-3 py-2.5" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <p className="text-white text-xs font-bold leading-tight">{theme.name}</p>
        <p className="text-white/30 text-[10px] mt-0.5 line-clamp-1">{theme.tagline}</p>
      </div>
    </motion.button>
  );
}
