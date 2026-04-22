/**
 * ColorWheelModal — Premium color picker with HSV wheel, HEX input,
 * curated palettes, recent colors, and save-to-player support.
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ColorWheelModalProps {
  open: boolean;
  onClose: () => void;
  activeColor: string;
  onColorChange: (hex: string) => void;
  savedColors: string[];
  onSaveColor: (hex: string) => void;
  recentColors: string[];
}

// ── Curated palettes ──────────────────────────────────────
const palettes: { name: string; colors: string[] }[] = [
  { name: 'Classic', colors: ['#FF6B6B', '#FF8C42', '#FFD93D', '#6BCB77', '#4ECDC4', '#45B7D1', '#A78BFA', '#FF8FAB'] },
  { name: 'Pastel', colors: ['#FFB3B3', '#FFDAB3', '#FFF4B3', '#B3E6B3', '#B3E8E8', '#B3D4FF', '#D4B3FF', '#FFB3D9'] },
  { name: 'Nature', colors: ['#2E7D32', '#4CAF50', '#8BC34A', '#795548', '#8D6E63', '#607D8B', '#455A64', '#33691E'] },
  { name: 'Skin & Hair', colors: ['#FDEBD0', '#F5CBA7', '#E8B88A', '#D4A574', '#C0956A', '#8B6914', '#5D4037', '#3E2723'] },
  { name: 'Ocean', colors: ['#E0F7FA', '#80DEEA', '#26C6DA', '#00ACC1', '#00838F', '#006064', '#1565C0', '#0D47A1'] },
  { name: 'Sunset', colors: ['#FFF9C4', '#FFE082', '#FFB74D', '#FF8A65', '#EF5350', '#C62828', '#AD1457', '#6A1B9A'] },
  { name: 'Night', colors: ['#1A1040', '#2D1B69', '#311B92', '#4A148C', '#0D47A1', '#1B5E20', '#263238', '#212121'] },
];

// ── HSV ↔ HEX conversions ─────────────────────────────────
function hsvToHex(h: number, s: number, v: number): string {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  const toHex = (n: number) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function hexToHsv(hex: string): { h: number; s: number; v: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  if (h < 0) h += 360;
  const s = max === 0 ? 0 : d / max;
  return { h, s, v: max };
}

export default function ColorWheelModal({
  open, onClose, activeColor, onColorChange, savedColors, onSaveColor, recentColors,
}: ColorWheelModalProps) {
  const [hsv, setHsv] = useState(() => hexToHsv(activeColor));
  const [hexInput, setHexInput] = useState(activeColor);
  const [activePalette, setActivePalette] = useState(0);
  const svAreaRef = useRef<HTMLDivElement>(null);
  const isDraggingSV = useRef(false);

  // Sync when activeColor changes externally
  useEffect(() => {
    if (open) {
      setHsv(hexToHsv(activeColor));
      setHexInput(activeColor);
    }
  }, [activeColor, open]);

  const currentHex = hsvToHex(hsv.h, hsv.s, hsv.v);

  const applyColor = useCallback((hex: string) => {
    setHexInput(hex);
    setHsv(hexToHsv(hex));
    onColorChange(hex);
  }, [onColorChange]);

  // SV area pointer handler
  const handleSVPointer = useCallback((clientX: number, clientY: number) => {
    const el = svAreaRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const s = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const v = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height));
    const newHsv = { ...hsv, s, v };
    setHsv(newHsv);
    const hex = hsvToHex(newHsv.h, newHsv.s, newHsv.v);
    setHexInput(hex);
    onColorChange(hex);
  }, [hsv, onColorChange]);

  const handleHexSubmit = useCallback(() => {
    const clean = hexInput.trim();
    if (/^#[0-9A-Fa-f]{6}$/.test(clean)) {
      applyColor(clean.toUpperCase());
    }
  }, [hexInput, applyColor]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.5)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
            style={{ background: 'linear-gradient(180deg, #2D2D3A 0%, #1F1F2E 100%)', maxWidth: 420, margin: '0 auto', maxHeight: '85vh' }}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-white/20" /></div>

            <div className="px-4 pb-5 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 16px)' }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold text-sm">Color Picker</h3>
                <button className="text-white/40 cursor-pointer" onClick={onClose} aria-label="Close">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>

              {/* Saturation/Value area */}
              <div
                ref={svAreaRef}
                className="relative w-full rounded-xl cursor-crosshair mb-3 touch-none"
                style={{
                  height: 140,
                  background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsv.h}, 100%, 50%))`,
                }}
                onPointerDown={(e) => { isDraggingSV.current = true; e.currentTarget.setPointerCapture(e.pointerId); handleSVPointer(e.clientX, e.clientY); }}
                onPointerMove={(e) => { if (isDraggingSV.current) handleSVPointer(e.clientX, e.clientY); }}
                onPointerUp={() => { isDraggingSV.current = false; }}
              >
                <div className="absolute w-4 h-4 rounded-full border-2 border-white -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, boxShadow: '0 0 4px rgba(0,0,0,0.5)' }} />
              </div>

              {/* Hue slider */}
              <div className="mb-3">
                <input
                  type="range" min={0} max={359} value={Math.round(hsv.h)}
                  onChange={(e) => {
                    const newH = Number(e.target.value);
                    const newHsv = { ...hsv, h: newH };
                    setHsv(newHsv);
                    const hex = hsvToHex(newHsv.h, newHsv.s, newHsv.v);
                    setHexInput(hex);
                    onColorChange(hex);
                  }}
                  className="w-full h-3 rounded-full cursor-pointer appearance-none"
                  style={{ background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)', accentColor: 'white' }}
                  aria-label="Hue"
                />
              </div>

              {/* HEX input + preview + save */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 rounded-lg flex-shrink-0 border border-white/10" style={{ background: currentHex }} />
                <div className="flex-1 flex items-center gap-1 px-2 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <span className="text-white/30 text-xs">#</span>
                  <input
                    type="text"
                    value={hexInput.replace('#', '')}
                    onChange={(e) => setHexInput('#' + e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6))}
                    onBlur={handleHexSubmit}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleHexSubmit(); }}
                    className="flex-1 bg-transparent text-white text-xs font-mono outline-none"
                    maxLength={6}
                    aria-label="HEX color code"
                  />
                </div>
                <motion.button
                  className="w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer"
                  style={{ background: 'rgba(107,203,119,0.3)' }}
                  onClick={() => onSaveColor(currentHex)}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Save this color"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6BCB77" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </motion.button>
              </div>

              {/* Saved colors */}
              {savedColors.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5">My Colors</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {savedColors.map((c) => (
                      <button key={c} className="w-7 h-7 rounded-md cursor-pointer" style={{ background: c, border: activeColor === c ? '2px solid white' : '1px solid rgba(255,255,255,0.08)' }} onClick={() => applyColor(c)} aria-label={c} />
                    ))}
                  </div>
                </div>
              )}

              {/* Recent colors */}
              {recentColors.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5">Recent</p>
                  <div className="flex gap-1.5">
                    {recentColors.slice(0, 10).map((c) => (
                      <button key={c} className="w-7 h-7 rounded-md cursor-pointer flex-shrink-0" style={{ background: c, border: '1px solid rgba(255,255,255,0.08)' }} onClick={() => applyColor(c)} aria-label={c} />
                    ))}
                  </div>
                </div>
              )}

              {/* Curated palettes */}
              <div>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1.5">Palettes</p>
                <div className="flex gap-1.5 mb-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                  {palettes.map((p, i) => (
                    <button key={p.name} className="flex-shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer" style={{ background: activePalette === i ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)', color: activePalette === i ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)' }} onClick={() => setActivePalette(i)}>
                      {p.name}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {palettes[activePalette].colors.map((c) => (
                    <button key={c} className="w-8 h-8 rounded-lg cursor-pointer" style={{ background: c, border: activeColor === c ? '2px solid white' : '1px solid rgba(255,255,255,0.08)' }} onClick={() => applyColor(c)} aria-label={c} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
