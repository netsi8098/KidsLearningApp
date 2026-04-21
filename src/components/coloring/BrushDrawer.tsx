/**
 * BrushDrawer — Slide-up panel showing brush library + size/opacity controls.
 * Inspired by Pixite/Pigment brush picker.
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

/** Render a small stroke preview for a brush type */
function BrushPreview({ brushId, color }: { brushId: BrushId; color: string }) {
  const previewWidth = 60;
  const previewHeight = 24;

  return (
    <svg width={previewWidth} height={previewHeight} viewBox={`0 0 ${previewWidth} ${previewHeight}`} aria-hidden="true">
      {brushId === 'pencil' && (
        <path d="M4 18 Q15 6 30 12 Q45 18 56 6" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      )}
      {brushId === 'crayon' && (
        <>
          <path d="M4 16 Q15 6 30 12 Q45 18 56 8" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />
          {[10, 20, 35, 48].map((x, i) => <rect key={i} x={x} y={10 + (i % 2) * 3} width="2" height="2" fill={color} opacity="0.3" />)}
        </>
      )}
      {brushId === 'marker' && (
        <path d="M4 16 Q15 6 30 12 Q45 18 56 8" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.85" />
      )}
      {brushId === 'airbrush' && (
        <>
          <ellipse cx="30" cy="12" rx="24" ry="8" fill={color} opacity="0.15" />
          <ellipse cx="30" cy="12" rx="16" ry="5" fill={color} opacity="0.1" />
        </>
      )}
      {brushId === 'watercolor' && (
        <>
          <ellipse cx="20" cy="12" rx="14" ry="7" fill={color} opacity="0.12" />
          <ellipse cx="35" cy="12" rx="16" ry="8" fill={color} opacity="0.1" />
          <ellipse cx="28" cy="12" rx="10" ry="5" fill={color} opacity="0.08" />
        </>
      )}
      {brushId === 'glitter' && (
        <>
          {[8, 16, 24, 32, 40, 48].map((x, i) => (
            <circle key={i} cx={x} cy={8 + (i % 3) * 4} r={1 + (i % 2)} fill={color} opacity={0.5 + (i % 3) * 0.15} />
          ))}
          {[12, 20, 36, 44].map((x, i) => (
            <circle key={`s${i}`} cx={x} cy={12 + (i % 2) * 4} r={0.8} fill="#FFE66D" opacity={0.4 + i * 0.1} />
          ))}
        </>
      )}
      {brushId === 'rainbow' && (
        <>
          {['#FF6B6B', '#FF8C42', '#FFD93D', '#6BCB77', '#45B7D1', '#A78BFA'].map((c, i) => (
            <line key={c} x1="4" y1={4 + i * 3} x2="56" y2={4 + i * 3} stroke={c} strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
          ))}
        </>
      )}
      {brushId === 'bigsoft' && (
        <ellipse cx="30" cy="12" rx="26" ry="10" fill={color} opacity="0.2" />
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
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-20"
            style={{ background: 'rgba(0,0,0,0.3)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-20 rounded-t-3xl"
            style={{
              background: 'linear-gradient(180deg, #2D2D3A 0%, #1F1F2E 100%)',
              maxWidth: 500,
              margin: '0 auto',
              maxHeight: '70vh',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            <div className="px-5 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 20px)' }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-sm">Brushes</h3>
                <motion.button
                  className="text-white/40 cursor-pointer"
                  onClick={onClose}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close brush picker"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </motion.button>
              </div>

              {/* Brush grid */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                {brushes.map((brush) => (
                  <motion.button
                    key={brush.id}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer text-left"
                    style={{
                      background: activeBrush === brush.id ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                      border: activeBrush === brush.id ? '1.5px solid rgba(255,255,255,0.2)' : '1.5px solid transparent',
                    }}
                    onClick={() => onBrushChange(brush.id)}
                    whileTap={{ scale: 0.97 }}
                    aria-label={`${brush.label} brush`}
                    aria-pressed={activeBrush === brush.id}
                  >
                    <BrushPreview brushId={brush.id} color={activeColor} />
                    <span className="text-xs font-bold text-white/80">{brush.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Size slider */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Size</span>
                  <span className="text-[11px] font-bold text-white/60">{brushSize}px</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ background: activeColor }} />
                  <input
                    type="range"
                    min={currentBrush.minSize}
                    max={currentBrush.maxSize}
                    value={brushSize}
                    onChange={(e) => onSizeChange(Number(e.target.value))}
                    className="flex-1 accent-white h-2 cursor-pointer"
                    style={{ accentColor: '#FF6B6B' }}
                    aria-label="Brush size"
                  />
                  <div className="w-6 h-6 rounded-full" style={{ background: activeColor }} />
                </div>
              </div>

              {/* Opacity slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Opacity</span>
                  <span className="text-[11px] font-bold text-white/60">{Math.round(brushOpacity * 100)}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded" style={{ background: activeColor, opacity: 0.2 }} />
                  <input
                    type="range"
                    min={5}
                    max={100}
                    value={Math.round(brushOpacity * 100)}
                    onChange={(e) => onOpacityChange(Number(e.target.value) / 100)}
                    className="flex-1 accent-white h-2 cursor-pointer"
                    style={{ accentColor: '#4ECDC4' }}
                    aria-label="Brush opacity"
                  />
                  <div className="w-4 h-4 rounded" style={{ background: activeColor }} />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
