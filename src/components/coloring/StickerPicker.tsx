/**
 * StickerPicker — Grid of SVG stickers to stamp on the canvas.
 * Replaces emoji stamps with custom illustrated stickers.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { stickers, type StickerDef } from './coloringTools';

interface StickerPickerProps {
  open: boolean;
  onClose: () => void;
  activeSticker: string | null;
  onStickerSelect: (sticker: StickerDef) => void;
}

export default function StickerPicker({ open, onClose, activeSticker, onStickerSelect }: StickerPickerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.3)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl"
            style={{
              background: 'linear-gradient(180deg, #2D2D3A 0%, #1F1F2E 100%)',
              maxWidth: 500,
              margin: '0 auto',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>
            <div className="px-5 pb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-sm">Stickers</h3>
                <motion.button
                  className="text-white/40 cursor-pointer"
                  onClick={onClose}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close sticker picker"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </motion.button>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {stickers.map((sticker) => (
                  <motion.button
                    key={sticker.id}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl cursor-pointer"
                    style={{
                      background: activeSticker === sticker.id ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
                      border: activeSticker === sticker.id ? '1.5px solid rgba(255,255,255,0.2)' : '1.5px solid transparent',
                    }}
                    onClick={() => { onStickerSelect(sticker); onClose(); }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`${sticker.label} sticker`}
                  >
                    <div className="w-10 h-10" dangerouslySetInnerHTML={{ __html: sticker.svg }} />
                    <span className="text-[10px] font-bold text-white/50">{sticker.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
