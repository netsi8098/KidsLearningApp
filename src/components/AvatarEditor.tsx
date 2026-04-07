import { motion } from 'framer-motion';
import AvatarFrame, { type AvatarFrameType } from './AvatarFrame';

interface AvatarEditorProps {
  currentEmoji: string;
  currentColor: string;
  currentFrame: AvatarFrameType;
  onEmojiChange: (emoji: string) => void;
  onColorChange: (color: string) => void;
  onFrameChange: (frame: AvatarFrameType) => void;
  unlockedFrames?: AvatarFrameType[];
  className?: string;
}

const avatarEmojiOptions = [
  '\u{1F981}', '\u{1F430}', '\u{1F98A}', '\u{1F989}', '\u{1F438}', '\u{1F43C}',
  '\u{1F984}', '\u{1F431}', '\u{1F436}', '\u{1F435}', '\u{1F98B}', '\u{1F419}',
];

const brandColors = [
  { value: '#FF6B6B', label: 'Coral' },
  { value: '#4ECDC4', label: 'Teal' },
  { value: '#FFE66D', label: 'Sunny' },
  { value: '#A78BFA', label: 'Grape' },
  { value: '#6BCB77', label: 'Leaf' },
  { value: '#FFD93D', label: 'Gold' },
  { value: '#FF8C42', label: 'Tangerine' },
  { value: '#74B9FF', label: 'Sky' },
];

const allFrameTypes: { type: AvatarFrameType; label: string; starsRequired: number }[] = [
  { type: 'basic', label: 'Basic', starsRequired: 0 },
  { type: 'star', label: 'Star', starsRequired: 0 },
  { type: 'crown', label: 'Crown', starsRequired: 50 },
  { type: 'rainbow', label: 'Rainbow', starsRequired: 30 },
  { type: 'sparkle', label: 'Sparkle', starsRequired: 20 },
  { type: 'nature', label: 'Nature', starsRequired: 10 },
];

export default function AvatarEditor({
  currentEmoji,
  currentColor,
  currentFrame,
  onEmojiChange,
  onColorChange,
  onFrameChange,
  unlockedFrames = ['basic', 'star', 'sparkle', 'nature', 'rainbow', 'crown'],
  className = '',
}: AvatarEditorProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* ── Preview ── */}
      <div className="flex justify-center py-4">
        <AvatarFrame
          emoji={currentEmoji}
          color={currentColor}
          size="xl"
          frameType={currentFrame}
          spotlight
          animated
        />
      </div>

      {/* ── Choose Avatar ── */}
      <div>
        <h4 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-2">
          Choose Avatar
        </h4>
        <div className="grid grid-cols-6 gap-2">
          {avatarEmojiOptions.map((emoji) => {
            const isSelected = currentEmoji === emoji;
            return (
              <motion.button
                key={emoji}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl cursor-pointer transition-all ${
                  isSelected
                    ? 'shadow-md'
                    : 'bg-[#FFF8F0]'
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: `${currentColor}15`,
                        boxShadow: `0 0 0 2.5px ${currentColor}`,
                      }
                    : undefined
                }
                onClick={() => onEmojiChange(emoji)}
                whileTap={{ scale: 0.9 }}
              >
                {emoji}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Choose Color ── */}
      <div>
        <h4 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-2">
          Choose Color
        </h4>
        <div className="flex flex-wrap gap-3">
          {brandColors.map((c) => {
            const isSelected = currentColor === c.value;
            return (
              <motion.button
                key={c.value}
                className="relative w-10 h-10 rounded-full cursor-pointer flex items-center justify-center"
                style={{
                  backgroundColor: c.value,
                  boxShadow: isSelected
                    ? `0 0 0 3px white, 0 0 0 5px ${c.value}`
                    : '0 2px 6px rgba(0,0,0,0.1)',
                }}
                onClick={() => onColorChange(c.value)}
                whileTap={{ scale: 0.9 }}
                aria-label={c.label}
              >
                {isSelected && (
                  <motion.svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    <path
                      d="M3 8.5L6.5 12L13 4"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.svg>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Choose Frame ── */}
      <div>
        <h4 className="text-[13px] font-extrabold text-[#6B6B7B] uppercase tracking-wider mb-2">
          Choose Frame
        </h4>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {allFrameTypes.map((ft) => {
            const isUnlocked = unlockedFrames.includes(ft.type);
            const isSelected = currentFrame === ft.type;
            return (
              <motion.button
                key={ft.type}
                className={`relative flex-shrink-0 flex flex-col items-center gap-1.5 p-2 rounded-2xl cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-white shadow-md'
                    : 'bg-[#FFF8F0]'
                } ${!isUnlocked ? 'opacity-50' : ''}`}
                style={
                  isSelected
                    ? { boxShadow: `0 0 0 2px ${currentColor}40, 0 2px 12px rgba(45,45,58,0.08)` }
                    : undefined
                }
                onClick={() => {
                  if (isUnlocked) onFrameChange(ft.type);
                }}
                whileTap={isUnlocked ? { scale: 0.95 } : undefined}
              >
                <AvatarFrame
                  emoji={currentEmoji}
                  color={currentColor}
                  size="sm"
                  frameType={ft.type}
                />
                <span className="text-[10px] font-bold text-[#6B6B7B]">{ft.label}</span>
                {!isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-2xl">
                    <div className="flex flex-col items-center">
                      <span className="text-base">🔒</span>
                      <span className="text-[8px] font-bold text-[#9B9BAB] mt-0.5">
                        {ft.starsRequired} {'\u2B50'}
                      </span>
                    </div>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
