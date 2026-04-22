/**
 * ColorRail — Bottom color palette strip for the coloring studio.
 * Shows 12 kid-friendly colors, recent colors, active color preview.
 */
import { motion } from 'framer-motion';
import { palette, type PaletteColor } from './coloringTools';

interface ColorRailProps {
  activeColor: string;
  onColorChange: (hex: string) => void;
  recentColors?: string[];
  /** Controlled expanded state — parent manages open/close */
  expanded?: boolean;
  onExpandedChange?: (open: boolean) => void;
}

export default function ColorRail({ activeColor, onColorChange, recentColors = [], expanded = false, onExpandedChange }: ColorRailProps) {
  const showMore = expanded;
  const setShowMore = (v: boolean) => onExpandedChange?.(v);

  return (
    <div className="relative">
      {/* Main palette rail */}
      <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl" style={{ background: 'rgba(45,45,58,0.85)', backdropFilter: 'blur(12px)' }}>
        {/* Active color preview */}
        <div
          className="w-9 h-9 rounded-lg flex-shrink-0 border-2"
          style={{
            background: activeColor,
            borderColor: activeColor === '#FFFFFF' ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',
            boxShadow: `0 0 8px ${activeColor}40`,
          }}
          aria-label={`Current color: ${activeColor}`}
        />

        {/* Divider */}
        <div className="w-px h-7 mx-1" style={{ background: 'rgba(255,255,255,0.15)' }} />

        {/* Color swatches — scrollable */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide flex-1" style={{ scrollbarWidth: 'none' }}>
          {palette.map((c) => (
            <ColorSwatch key={c.hex} color={c} active={activeColor === c.hex} onSelect={onColorChange} />
          ))}
        </div>

        {/* More colors button */}
        <div className="w-px h-7 mx-1" style={{ background: 'rgba(255,255,255,0.15)' }} />
        <motion.button
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.1)' }}
          onClick={() => setShowMore(!showMore)}
          whileTap={{ scale: 0.9 }}
          aria-label="More colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="7" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
            <circle cx="5" cy="6" r="1.5" fill="#FF6B6B" />
            <circle cx="11" cy="6" r="1.5" fill="#4ECDC4" />
            <circle cx="6.5" cy="11" r="1.5" fill="#FFD93D" />
            <circle cx="9.5" cy="11" r="1.5" fill="#A78BFA" />
          </svg>
        </motion.button>
      </div>

      {/* Extended palette is rendered by the parent (ColoringPage) at z-35 */}
    </div>
  );
}

function ColorSwatch({ color, active, onSelect, size = 'md' }: { color: PaletteColor; active: boolean; onSelect: (hex: string) => void; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';
  return (
    <motion.button
      className={`${dim} rounded-lg flex-shrink-0 cursor-pointer relative`}
      style={{
        background: color.hex,
        border: color.hex === '#FFFFFF' || color.hex === '#F5E6C8'
          ? '1.5px solid rgba(255,255,255,0.25)'
          : active ? '2px solid white' : '1.5px solid rgba(255,255,255,0.08)',
        boxShadow: active ? `0 0 0 2px rgba(255,255,255,0.3), 0 0 10px ${color.hex}50` : 'none',
      }}
      onClick={() => onSelect(color.hex)}
      whileTap={{ scale: 0.85 }}
      aria-label={`${color.label} color`}
      aria-pressed={active}
    >
      {active && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M2 6L5 9L10 3" stroke={color.hex === '#FFFFFF' || color.hex === '#FFD93D' || color.hex === '#FFE0B2' || color.hex === '#F5E6C8' ? '#2D2D3A' : 'white'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
}
