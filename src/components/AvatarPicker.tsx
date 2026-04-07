import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { avatarEmojis } from '../data/avatarData';

export type AvatarMode = 'sticker' | 'photo';

interface AvatarPickerProps {
  selected: string;
  onSelect: (emoji: string) => void;
  /** Base64 photo data URL */
  photo?: string;
  onPhotoChange?: (dataUrl: string | undefined) => void;
}

/** Resize an image to max 256x256 and compress as JPEG. */
function resizeImage(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const max = 256;
      let w = img.width;
      let h = img.height;
      if (w > max || h > max) {
        const scale = max / Math.max(w, h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      // Draw circular crop
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function AvatarPicker({ selected, onSelect, photo, onPhotoChange }: AvatarPickerProps) {
  const [mode, setMode] = useState<AvatarMode>(photo ? 'photo' : 'sticker');
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File | undefined) => {
    if (!file || !onPhotoChange) return;
    try {
      const dataUrl = await resizeImage(file);
      onPhotoChange(dataUrl);
    } catch {
      // silently fail
    }
  }, [onPhotoChange]);

  const handleUpload = () => fileRef.current?.click();
  const handleCamera = () => cameraRef.current?.click();

  const removePhoto = () => {
    onPhotoChange?.(undefined);
    setMode('sticker');
  };

  return (
    <div className="space-y-4">
      {/* Mode toggle tabs */}
      <div className="flex gap-2 justify-center">
        <motion.button
          className={`px-4 py-2 rounded-full text-sm font-bold cursor-pointer transition-all border ${
            mode === 'sticker'
              ? 'bg-gradient-to-r from-coral to-[#FF8E8E] text-white border-coral/30 shadow-md'
              : 'bg-white text-[#6B6B7B] border-[#F0EAE0]'
          }`}
          onClick={() => setMode('sticker')}
          whileTap={{ scale: 0.95 }}
        >
          {'\u{1F43E}'} Stickers
        </motion.button>
        <motion.button
          className={`px-4 py-2 rounded-full text-sm font-bold cursor-pointer transition-all border ${
            mode === 'photo'
              ? 'bg-gradient-to-r from-teal to-[#38BDF8] text-white border-teal/30 shadow-md'
              : 'bg-white text-[#6B6B7B] border-[#F0EAE0]'
          }`}
          onClick={() => setMode('photo')}
          whileTap={{ scale: 0.95 }}
        >
          {'\u{1F4F7}'} Photo
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'sticker' ? (
          /* ── Sticker / Emoji Grid ── */
          <motion.div
            key="sticker"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-4 gap-3 max-w-xs mx-auto"
          >
            {avatarEmojis.map((emoji, i) => (
              <motion.button
                key={emoji}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl cursor-pointer ${
                  selected === emoji && !photo
                    ? 'bg-coral shadow-lg ring-4 ring-coral/30'
                    : 'bg-white shadow-md'
                }`}
                onClick={() => {
                  onSelect(emoji);
                  onPhotoChange?.(undefined);
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: i * 0.03 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {emoji}
              </motion.button>
            ))}
          </motion.div>
        ) : (
          /* ── Photo Mode ── */
          <motion.div
            key="photo"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center gap-4"
          >
            {/* Photo preview */}
            {photo ? (
              <motion.div
                className="relative"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div
                  className="w-28 h-28 rounded-full overflow-hidden shadow-lg ring-4 ring-teal/30"
                >
                  <img
                    src={photo}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <motion.button
                  className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-coral text-white text-xs font-bold flex items-center justify-center shadow-md cursor-pointer"
                  onClick={removePhoto}
                  whileTap={{ scale: 0.9 }}
                >
                  {'\u2715'}
                </motion.button>
              </motion.div>
            ) : (
              <div className="w-28 h-28 rounded-full bg-[#F0EAE0] flex items-center justify-center">
                <span className="text-4xl text-[#9B9BAB]">{'\u{1F464}'}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <motion.button
                className="flex items-center gap-2 px-5 py-3 rounded-[14px] bg-white shadow-md border border-[#F0EAE0] font-bold text-sm text-[#2D2D3A] cursor-pointer"
                onClick={handleCamera}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg">{'\u{1F4F8}'}</span> Camera
              </motion.button>
              <motion.button
                className="flex items-center gap-2 px-5 py-3 rounded-[14px] bg-white shadow-md border border-[#F0EAE0] font-bold text-sm text-[#2D2D3A] cursor-pointer"
                onClick={handleUpload}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg">{'\u{1F5BC}\u{FE0F}'}</span> Upload
              </motion.button>
            </div>

            <p className="text-xs text-[#9B9BAB] text-center">
              Take a selfie or upload a photo from your gallery
            </p>

            {/* Hidden file inputs */}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="user"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
