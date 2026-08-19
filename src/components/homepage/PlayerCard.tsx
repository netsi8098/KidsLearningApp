/**
 * PlayerCard / NewPlayerCard — the player-select cards from the reference art.
 *
 * The references treat these as physical objects resting on the world's
 * foreground surface: warm off-white, generous radius, soft contact shadow,
 * a prominent avatar ring in the player's accent colour, an age pill, star and
 * streak metadata, and a progress bar. They lift on hover and compress on
 * press rather than merely changing colour.
 */
import { motion } from 'framer-motion';
import AvatarFrame from '../AvatarFrame';
import { useMotionPreset } from '../../motion/useMotionPreset';

function StarIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#FFC531" aria-hidden="true">
      <path d="M12 1.6l3 6.5 7 .8-5.2 4.7 1.4 7-6.2-3.5L5.8 20.6l1.4-7L2 8.9l7-.8z" />
    </svg>
  );
}

function FlameIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#FF7A3D" aria-hidden="true">
      <path d="M13 2s.8 3-1.6 5.4C9 9.8 7 11.6 7 14.6A5.6 5.6 0 0 0 12.6 20a5.4 5.4 0 0 0 5.4-5.4c0-3.6-2.4-4.8-2.4-7.4C15.6 4.6 13 2 13 2z" />
    </svg>
  );
}

export interface PlayerCardProps {
  name: string;
  age?: number;
  stars: number;
  streakDays: number;
  avatarEmoji?: string;
  avatarPhoto?: string;
  accent: string;
  /** Marks the most recently played profile. */
  isRecent?: boolean;
  isSelected?: boolean;
  /** 0–1, drives the progress bar under the metadata. */
  progress?: number;
  index?: number;
  onSelect: () => void;
  onFocusChange?: (focused: boolean) => void;
}

export function PlayerCard({
  name,
  age,
  stars,
  streakDays,
  avatarEmoji,
  avatarPhoto,
  accent,
  isRecent,
  isSelected,
  progress = 0,
  index = 0,
  onSelect,
  onFocusChange,
}: PlayerCardProps) {
  const { isReducedMotion, springs } = usePresetSprings();

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      onHoverStart={() => onFocusChange?.(true)}
      onHoverEnd={() => onFocusChange?.(false)}
      onFocus={() => onFocusChange?.(true)}
      onBlur={() => onFocusChange?.(false)}
      aria-label={`Play as ${name}${age ? `, age ${age}` : ''}`}
      className="relative flex flex-col items-center cursor-pointer text-center rounded-[26px] px-3 pt-4 pb-3.5 w-full"
      style={{
        background: 'linear-gradient(180deg, #FFFDFB 0%, #FFF6EE 100%)',
        boxShadow: isSelected
          ? `0 14px 30px rgba(0,0,0,0.22), 0 0 0 3px ${accent}, 0 3px 6px -2px rgba(0,0,0,0.4)`
          : '0 10px 24px rgba(0,0,0,0.18), 0 3px 6px -2px rgba(0,0,0,0.34)',
        border: '1px solid rgba(255,255,255,0.85)',
      }}
      initial={isReducedMotion ? { opacity: 0 } : { opacity: 0, y: 26, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...springs.gentle, delay: isReducedMotion ? 0 : 0.35 + index * 0.07 }}
      whileHover={isReducedMotion ? undefined : { y: -8, scale: 1.035 }}
      whileTap={isReducedMotion ? undefined : { scale: 0.97, y: -2 }}
    >
      {isRecent && (
        <span
          className="absolute -top-2 right-3 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
          style={{ background: '#43B77A', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}
        >
          Recent
        </span>
      )}

      {/* Avatar in an accent ring — the card's focal point */}
      <span
        className="relative flex items-center justify-center rounded-full overflow-hidden flex-shrink-0"
        style={{
          width: 68,
          height: 68,
          border: `3.5px solid ${accent}`,
          background: `${accent}18`,
          boxShadow: `0 4px 12px ${accent}55`,
        }}
      >
        <AvatarFrame emoji={avatarEmoji} photo={avatarPhoto} size="md" />
      </span>

      {age != null && (
        <span
          className="mt-2 px-2.5 py-[3px] rounded-full text-[11px] font-extrabold text-white leading-none"
          style={{ background: accent, boxShadow: `0 2px 6px ${accent}66` }}
        >
          Age {age}
        </span>
      )}

      <span
        className="font-display mt-1.5 leading-tight w-full truncate px-1"
        style={{ color: '#3A3A48', fontSize: 17 }}
      >
        {name}
      </span>

      <span className="flex items-center justify-center gap-3 mt-1">
        <span className="flex items-center gap-1 text-[13px] font-extrabold" style={{ color: '#C98A0B' }}>
          <StarIcon />
          {stars}
        </span>
        {streakDays > 0 && (
          <span className="flex items-center gap-1 text-[13px] font-extrabold" style={{ color: '#E0632C' }}>
            <FlameIcon />
            {streakDays}
          </span>
        )}
      </span>

      {/* Progress rail — the reference cards all carry one */}
      <span
        className="block w-full rounded-full mt-2.5 overflow-hidden"
        style={{ height: 7, background: 'rgba(0,0,0,0.09)' }}
      >
        <motion.span
          className="block h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${accent}, ${accent}CC)` }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.round(Math.max(0, Math.min(1, progress)) * 100)}%` }}
          transition={{ duration: 0.9, delay: 0.5 + index * 0.07, ease: [0.22, 1, 0.36, 1] }}
        />
      </span>
    </motion.button>
  );
}

export interface NewPlayerCardProps {
  disabled?: boolean;
  index?: number;
  onClick: () => void;
}

export function NewPlayerCard({ disabled, index = 0, onClick }: NewPlayerCardProps) {
  const { isReducedMotion, springs } = usePresetSprings();

  return (
    <motion.button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={disabled ? 'Player limit reached' : 'Create a new player'}
      className="relative flex flex-col items-center justify-center gap-2.5 rounded-[26px] px-3 py-6 w-full cursor-pointer"
      style={{
        background: disabled ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.58)',
        border: `2px dashed ${disabled ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.95)'}`,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: '0 8px 22px rgba(0,0,0,0.14)',
      }}
      initial={isReducedMotion ? { opacity: 0 } : { opacity: 0, y: 26, scale: 0.94 }}
      animate={{ opacity: disabled ? 0.55 : 1, y: 0, scale: 1 }}
      transition={{ ...springs.gentle, delay: isReducedMotion ? 0 : 0.35 + index * 0.07 }}
      whileHover={disabled || isReducedMotion ? undefined : { y: -8, scale: 1.035 }}
      whileTap={disabled || isReducedMotion ? undefined : { scale: 0.97 }}
    >
      {/* The plus quietly invites a tap rather than sitting inert */}
      <motion.span
        className="flex items-center justify-center rounded-full text-white"
        style={{
          width: 52,
          height: 52,
          background: 'linear-gradient(140deg, #A78BFA 0%, #8B6FE8 100%)',
          boxShadow: '0 6px 16px rgba(139,111,232,0.5)',
          fontSize: 30,
          lineHeight: 1,
          paddingBottom: 4,
        }}
        animate={disabled || isReducedMotion ? undefined : { scale: [1, 1.07, 1] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        +
      </motion.span>
      <span className="font-display text-[15px]" style={{ color: '#FFFFFF', textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
        New Player
      </span>
    </motion.button>
  );
}

/** Small local hook so both cards share motion config without prop drilling. */
function usePresetSprings() {
  const { isReducedMotion, preset } = useMotionPreset();
  return { isReducedMotion, springs: preset.springs };
}
