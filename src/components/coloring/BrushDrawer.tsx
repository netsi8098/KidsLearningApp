/**
 * BrushDrawer — Pigment-style horizontal tool shelf.
 * Shows realistic tool tip icons in a scrollable strip.
 * Size/opacity sliders below.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { brushes, type BrushId } from './coloringTools';

interface BrushDrawerProps {
  open: boolean;
  onClose: () => void;
  activeBrush: BrushId;
  onBrushChange: (id: BrushId) => void;
  brushSize: number;
  onSizeChange: (size: number) => void;
  brushOpacity: number;
  onOpacityChange: (opacity: number) => void;
  activeColor: string;
}

/** Realistic tool tip SVG for each brush */
function ToolTipIcon({ brushId, color, active }: { brushId: BrushId; color: string; active: boolean }) {
  const w = 36;
  const h = 56;
  const tipColor = active ? color : '#9B9BAB';
  const bodyColor = active ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)';

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" aria-hidden="true">
      {brushId === 'pencil' && (
        <>
          <rect x="14" y="4" width="8" height="36" rx="1" fill="#E6C84A" />
          <rect x="14" y="4" width="8" height="6" rx="1" fill="#D4A050" />
          <polygon points="14,40 22,40 18,52" fill={tipColor} />
          <rect x="16" y="2" width="4" height="4" rx="1" fill="#FFB6C1" opacity="0.5" />
        </>
      )}
      {brushId === 'crayon' && (
        <>
          <rect x="10" y="8" width="16" height="32" rx="3" fill={tipColor} opacity="0.85" />
          <rect x="12" y="10" width="12" height="4" rx="1" fill="white" opacity="0.15" />
          <polygon points="12,40 24,40 18,52" fill={tipColor} opacity="0.9" />
          <rect x="10" y="6" width="16" height="4" rx="2" fill={tipColor} opacity="0.6" />
        </>
      )}
      {brushId === 'marker' && (
        <>
          <rect x="12" y="6" width="12" height="28" rx="2" fill={bodyColor} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          <rect x="12" y="6" width="12" height="6" rx="2" fill="rgba(255,255,255,0.1)" />
          <rect x="14" y="34" width="8" height="10" rx="1" fill={tipColor} />
          <rect x="15" y="44" width="6" height="6" rx="3" fill={tipColor} opacity="0.9" />
        </>
      )}
      {brushId === 'airbrush' && (
        <>
          <ellipse cx="18" cy="30" rx="12" ry="16" fill={tipColor} opacity="0.12" />
          <ellipse cx="18" cy="30" rx="8" ry="10" fill={tipColor} opacity="0.15" />
          <ellipse cx="18" cy="30" rx="4" ry="5" fill={tipColor} opacity="0.2" />
          <rect x="16" y="6" width="4" height="16" rx="2" fill="rgba(255,255,255,0.15)" />
          <circle cx="18" cy="6" r="3" fill="rgba(255,255,255,0.1)" />
        </>
      )}
      {brushId === 'watercolor' && (
        <>
          <rect x="14" y="4" width="8" height="26" rx="2" fill="#8D6E63" opacity="0.4" />
          <ellipse cx="18" cy="36" rx="10" ry="6" fill={tipColor} opacity="0.2" />
          <ellipse cx="18" cy="38" rx="8" ry="8" fill={tipColor} opacity="0.15" />
          <ellipse cx="18" cy="34" rx="6" ry="4" fill={tipColor} opacity="0.25" />
          <rect x="16" y="28" width="4" height="10" rx="1" fill="#8D6E63" opacity="0.3" />
        </>
      )}
      {brushId === 'glitter' && (
        <>
          {[
            [12, 14], [24, 10], [18, 24], [10, 32], [26, 28], [14, 42], [22, 38], [18, 48], [8, 20], [28, 18],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={1 + (i % 3) * 0.5} fill={i % 2 === 0 ? tipColor : '#FFE66D'} opacity={0.4 + (i % 4) * 0.12} />
          ))}
          <circle cx="18" cy="28" r="2" fill="white" opacity="0.3" />
        </>
      )}
      {brushId === 'rainbow' && (
        <>
          {['#FF6B6B', '#FF8C42', '#FFD93D', '#6BCB77', '#45B7D1', '#A78BFA'].map((c, i) => (
            <rect key={c} x="8" y={10 + i * 6} width="20" height="5" rx="2.5" fill={c} opacity="0.7" />
          ))}
        </>
      )}
      {brushId === 'bigsoft' && (
        <>
          <rect x="14" y="4" width="8" height="22" rx="2" fill="#8D6E63" opacity="0.3" />
          <ellipse cx="18" cy="34" rx="14" ry="12" fill={tipColor} opacity="0.15" />
          <ellipse cx="18" cy="32" rx="10" ry="8" fill={tipColor} opacity="0.12" />
          <rect x="14" y="24" width="8" height="6" rx="2" fill="#D4A574" opacity="0.3" />
        </>
      )}
    </svg>
  );
}

export default function BrushDrawer({
  open,
  onClose,
  activeBrush,
  onBrushChange,
  brushSize,
  onSizeChange,
  brushOpacity,
  onOpacityChange,
  activeColor,
}: BrushDrawerProps) {
  const currentBrush = brushes.find((b) => b.id === activeBrush) || brushes[0];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — tappable to close */}
          <motion.div
            className="fixed inset-0 z-20"
            style={{ background: 'rgba(0,0,0,0.25)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-20 rounded-t-2xl"
            style={{
              background: 'linear-gradient(180deg, rgba(45,45,58,0.97) 0%, rgba(31,31,46,0.98) 100%)',
              backdropFilter: 'blur(16px)',
              maxWidth: 500,
              margin: '0 auto',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-2.5 pb-1">
              <div className="w-8 h-1 rounded-full bg-white/20" />
            </div>

            <div className="px-4 pb-5">
              {/* Tool shelf — horizontal scroll */}
              <div className="flex gap-1 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                {brushes.map((b) => (
                  <motion.button
                    key={b.id}
                    className="flex flex-col items-center gap-0.5 flex-shrink-0 cursor-pointer rounded-xl px-1.5 py-1.5"
                    style={{
                      background: activeBrush === b.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                      border: activeBrush === b.id ? '1.5px solid rgba(255,255,255,0.15)' : '1.5px solid transparent',
                      minWidth: 52,
                    }}
                    onClick={() => onBrushChange(b.id)}
                    whileTap={{ scale: 0.92 }}
                    aria-label={`${b.label} brush`}
                    aria-pressed={activeBrush === b.id}
                  >
                    <ToolTipIcon brushId={b.id} color={activeColor} active={activeBrush === b.id} />
                    <span className="text-[9px] font-bold" style={{ color: activeBrush === b.id ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)' }}>
                      {b.label}
                    </span>
                  </motion.button>
                ))}
              </div>

              {/* Size slider */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-white/35 uppercase tracking-wider">Size</span>
                  <span className="text-[10px] font-bold text-white/50">{brushSize}px</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: activeColor }} />
                  <input
                    type="range"
                    min={currentBrush.minSize}
                    max={currentBrush.maxSize}
                    value={brushSize}
                    onChange={(e) => onSizeChange(Number(e.target.value))}
                    className="flex-1 h-1.5 cursor-pointer appearance-none rounded-full"
                    style={{ background: `linear-gradient(90deg, ${activeColor}60, ${activeColor})`, accentColor: activeColor }}
                    aria-label="Brush size"
                  />
                  <div className="w-5 h-5 rounded-full" style={{ background: activeColor }} />
                </div>
              </div>

              {/* Opacity slider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-white/35 uppercase tracking-wider">Opacity</span>
                  <span className="text-[10px] font-bold text-white/50">{Math.round(brushOpacity * 100)}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3.5 h-3.5 rounded" style={{ background: activeColor, opacity: 0.2 }} />
                  <input
                    type="range"
                    min={5}
                    max={100}
                    value={Math.round(brushOpacity * 100)}
                    onChange={(e) => onOpacityChange(Number(e.target.value) / 100)}
                    className="flex-1 h-1.5 cursor-pointer appearance-none rounded-full"
                    style={{ background: `linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.5))`, accentColor: '#4ECDC4' }}
                    aria-label="Brush opacity"
                  />
                  <div className="w-3.5 h-3.5 rounded" style={{ background: activeColor }} />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
