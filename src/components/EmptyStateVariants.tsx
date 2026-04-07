import { motion } from 'framer-motion';
import EmptyState from './EmptyState';

// ── Shared variant props type ───────────────────────────────
interface VariantProps {
  onAction?: () => void;
  onSecondaryAction?: () => void;
  className?: string;
}

// ── Floating decoration helpers ─────────────────────────────

function FloatingHearts() {
  const hearts = [
    { left: '15%', top: '10%', size: 16, delay: 0 },
    { right: '12%', top: '20%', size: 12, delay: 0.5 },
    { left: '25%', bottom: '18%', size: 14, delay: 1.0 },
    { right: '22%', bottom: '12%', size: 10, delay: 1.5 },
    { left: '8%', top: '45%', size: 11, delay: 0.8 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {hearts.map((h, i) => (
        <motion.span
          key={i}
          className="absolute"
          style={{
            left: h.left,
            right: h.right,
            top: h.top,
            bottom: h.bottom,
            fontSize: h.size,
            opacity: 0,
          }}
          animate={{
            opacity: [0, 0.3, 0],
            y: [0, -12, 0],
            scale: [0.8, 1.1, 0.8],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: h.delay,
            ease: 'easeInOut',
          }}
        >
          {'\u2764'}
        </motion.span>
      ))}
    </div>
  );
}

function ClockMotif() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Subtle timeline line */}
      <motion.div
        className="absolute left-1/2 top-[15%] w-[1px] rounded-full"
        style={{ backgroundColor: '#A78BFA', height: '70%', opacity: 0 }}
        animate={{ opacity: 0.08 }}
        transition={{ duration: 1 }}
      />
      {/* Timeline dots */}
      {[20, 35, 50, 65, 80].map((top, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 -translate-x-1/2 rounded-full"
          style={{ top: `${top}%`, width: 6, height: 6, backgroundColor: '#A78BFA', opacity: 0 }}
          animate={{ opacity: 0.12 }}
          transition={{ delay: i * 0.15, duration: 0.5 }}
        />
      ))}
    </div>
  );
}

function SearchPulse() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
          style={{ borderColor: '#4ECDC4', width: 100 + i * 60, height: 100 + i * 60, opacity: 0 }}
          animate={{ opacity: [0, 0.08, 0], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 3, repeat: Infinity, delay: i * 0.8, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

function OfflineCloud() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Crossed-out cloud motif using circles */}
      <motion.div
        className="absolute top-[12%] right-[10%] rounded-full"
        style={{ width: 50, height: 30, backgroundColor: '#FF6B6B', opacity: 0 }}
        animate={{ opacity: 0.06 }}
        transition={{ duration: 1.2 }}
      />
      <motion.div
        className="absolute bottom-[15%] left-[8%] rounded-full"
        style={{ width: 40, height: 24, backgroundColor: '#FF6B6B', opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ duration: 1.2, delay: 0.3 }}
      />
      {/* Diagonal strikethrough line */}
      <motion.div
        className="absolute top-1/4 right-[8%] origin-center"
        style={{
          width: 60,
          height: 2,
          backgroundColor: '#FF6B6B',
          transform: 'rotate(-45deg)',
          opacity: 0,
        }}
        animate={{ opacity: 0.1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      />
    </div>
  );
}

function TwinklingStars() {
  const stars = [
    { left: '10%', top: '8%', size: 3, delay: 0 },
    { right: '15%', top: '12%', size: 2, delay: 0.4 },
    { left: '20%', top: '25%', size: 2.5, delay: 0.8 },
    { right: '8%', top: '40%', size: 3, delay: 1.2 },
    { left: '12%', bottom: '20%', size: 2, delay: 0.2 },
    { right: '25%', bottom: '25%', size: 3.5, delay: 0.6 },
    { left: '35%', top: '15%', size: 2, delay: 1.0 },
    { right: '35%', bottom: '15%', size: 2.5, delay: 1.4 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {/* Moon */}
      <motion.div
        className="absolute top-[8%] right-[12%] rounded-full"
        style={{ width: 28, height: 28, backgroundColor: '#FFE66D', opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 2, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-[6%] right-[11%] rounded-full"
        style={{ width: 20, height: 20, backgroundColor: '#1E2140' }}
      />
      {/* Stars */}
      {stars.map((s, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: s.left,
            right: s.right,
            top: s.top,
            bottom: s.bottom,
            width: s.size,
            height: s.size,
            backgroundColor: '#F3EFFE',
            opacity: 0,
          }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: s.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function FloatingSparkles() {
  const sparkles = [
    { left: '18%', top: '12%', delay: 0, size: 14 },
    { right: '15%', top: '18%', delay: 0.3, size: 12 },
    { left: '10%', bottom: '22%', delay: 0.6, size: 16 },
    { right: '20%', bottom: '15%', delay: 0.9, size: 10 },
    { left: '40%', top: '8%', delay: 1.2, size: 13 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {sparkles.map((s, i) => (
        <motion.span
          key={i}
          className="absolute"
          style={{
            left: s.left,
            right: s.right,
            top: s.top,
            bottom: s.bottom,
            fontSize: s.size,
            opacity: 0,
          }}
          animate={{ opacity: [0, 0.5, 0], rotate: [0, 180, 360], scale: [0.6, 1.2, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
        >
          {'\u2728'}
        </motion.span>
      ))}
    </div>
  );
}

function ScheduleDashes() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {[18, 30, 42, 54, 66].map((top, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: '20%',
            width: '60%',
            top: `${top}%`,
            height: 2,
            backgroundColor: '#FF8C42',
            opacity: 0,
          }}
          animate={{ opacity: 0.06 }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
        />
      ))}
    </div>
  );
}

function ConfettiSparkles() {
  const pieces = [
    { left: '8%', top: '5%', color: '#FF6B6B', delay: 0, rotation: 45 },
    { right: '10%', top: '8%', color: '#4ECDC4', delay: 0.2, rotation: -30 },
    { left: '15%', top: '20%', color: '#FFE66D', delay: 0.4, rotation: 60 },
    { right: '18%', top: '15%', color: '#A78BFA', delay: 0.6, rotation: -45 },
    { left: '5%', bottom: '25%', color: '#6BCB77', delay: 0.8, rotation: 30 },
    { right: '8%', bottom: '20%', color: '#FF8C42', delay: 1.0, rotation: -60 },
    { left: '30%', top: '6%', color: '#FF6B6B', delay: 0.3, rotation: 15 },
    { right: '30%', top: '10%', color: '#FFD93D', delay: 0.5, rotation: -20 },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {pieces.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-sm"
          style={{
            left: p.left,
            right: p.right,
            top: p.top,
            bottom: p.bottom,
            width: 8,
            height: 8,
            backgroundColor: p.color,
            opacity: 0,
            rotate: p.rotation,
          }}
          animate={{
            opacity: [0, 0.4, 0],
            y: [0, -15, 0],
            rotate: [p.rotation, p.rotation + 90, p.rotation],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function InboxCheckmarks() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {[
        { left: '12%', top: '15%', delay: 0 },
        { right: '15%', top: '25%', delay: 0.3 },
        { left: '20%', bottom: '20%', delay: 0.6 },
      ].map((c, i) => (
        <motion.span
          key={i}
          className="absolute text-[14px]"
          style={{ left: c.left, right: c.right, top: c.top, bottom: c.bottom, opacity: 0 }}
          animate={{ opacity: [0, 0.2, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: c.delay, ease: 'easeInOut' }}
        >
          {'\u2714'}
        </motion.span>
      ))}
    </div>
  );
}

// ── Decorative circle presets per variant ────────────────────

const circlePresets = {
  favorites: [
    { top: '5%', left: '8%', size: 60, color: '#FFE66D', opacity: 0.06 },
    { top: '20%', right: '5%', size: 50, color: '#FF6B6B', opacity: 0.04 },
    { bottom: '10%', left: '15%', size: 70, color: '#FFD93D', opacity: 0.05 },
    { bottom: '25%', right: '12%', size: 45, color: '#FF8C42', opacity: 0.04 },
  ],
  history: [
    { top: '8%', left: '10%', size: 55, color: '#A78BFA', opacity: 0.05 },
    { top: '25%', right: '8%', size: 45, color: '#C4AAFF', opacity: 0.04 },
    { bottom: '12%', left: '20%', size: 65, color: '#A78BFA', opacity: 0.04 },
    { bottom: '30%', right: '15%', size: 40, color: '#F3EFFE', opacity: 0.06 },
  ],
  search: [
    { top: '10%', left: '5%', size: 50, color: '#4ECDC4', opacity: 0.05 },
    { top: '30%', right: '8%', size: 60, color: '#6FE0D9', opacity: 0.04 },
    { bottom: '15%', left: '12%', size: 45, color: '#4ECDC4', opacity: 0.04 },
    { bottom: '20%', right: '18%', size: 55, color: '#EDFAF8', opacity: 0.06 },
  ],
  offline: [
    { top: '10%', left: '10%', size: 60, color: '#FF6B6B', opacity: 0.05 },
    { top: '20%', right: '12%', size: 45, color: '#FF8E8E', opacity: 0.04 },
    { bottom: '15%', left: '18%', size: 50, color: '#FF6B6B', opacity: 0.04 },
    { bottom: '28%', right: '8%', size: 70, color: '#FFF0F0', opacity: 0.06 },
  ],
  downloads: [
    { top: '8%', left: '8%', size: 55, color: '#4ECDC4', opacity: 0.05 },
    { top: '22%', right: '10%', size: 50, color: '#6FE0D9', opacity: 0.04 },
    { bottom: '10%', left: '15%', size: 60, color: '#4ECDC4', opacity: 0.04 },
    { bottom: '30%', right: '15%', size: 40, color: '#EDFAF8', opacity: 0.06 },
  ],
  bedtime: [
    { top: '8%', left: '5%', size: 80, color: '#3D3D80', opacity: 0.12 },
    { top: '30%', right: '10%', size: 50, color: '#4A4A8A', opacity: 0.08 },
    { bottom: '10%', left: '12%', size: 60, color: '#3D3D80', opacity: 0.1 },
    { bottom: '35%', right: '8%', size: 70, color: '#2A2A60', opacity: 0.08 },
  ],
  schedule: [
    { top: '10%', left: '8%', size: 55, color: '#FF8C42', opacity: 0.05 },
    { top: '25%', right: '10%', size: 50, color: '#FFA366', opacity: 0.04 },
    { bottom: '12%', left: '15%', size: 65, color: '#FF8C42', opacity: 0.04 },
    { bottom: '28%', right: '12%', size: 45, color: '#FFF3EB', opacity: 0.06 },
  ],
  mediaError: [
    { top: '8%', left: '10%', size: 60, color: '#FF6B6B', opacity: 0.05 },
    { top: '22%', right: '8%', size: 50, color: '#FF8E8E', opacity: 0.04 },
    { bottom: '15%', left: '12%', size: 55, color: '#FF6B6B', opacity: 0.04 },
    { bottom: '25%', right: '15%', size: 45, color: '#FFF0F0', opacity: 0.06 },
  ],
  inbox: [
    { top: '10%', left: '8%', size: 55, color: '#6BCB77', opacity: 0.05 },
    { top: '22%', right: '10%', size: 48, color: '#8DD98D', opacity: 0.04 },
    { bottom: '12%', left: '18%', size: 60, color: '#6BCB77', opacity: 0.04 },
    { bottom: '28%', right: '12%', size: 42, color: '#EDFAEF', opacity: 0.06 },
  ],
  rewards: [
    { top: '8%', left: '10%', size: 60, color: '#FFD93D', opacity: 0.06 },
    { top: '25%', right: '8%', size: 50, color: '#FFE470', opacity: 0.05 },
    { bottom: '12%', left: '15%', size: 55, color: '#FFD93D', opacity: 0.05 },
    { bottom: '30%', right: '15%', size: 45, color: '#FFF8E1', opacity: 0.06 },
  ],
  firstUse: [
    { top: '5%', left: '5%', size: 70, color: '#FF6B6B', opacity: 0.05 },
    { top: '15%', right: '8%', size: 55, color: '#4ECDC4', opacity: 0.04 },
    { bottom: '8%', left: '10%', size: 65, color: '#A78BFA', opacity: 0.04 },
    { bottom: '20%', right: '10%', size: 50, color: '#FFE66D', opacity: 0.05 },
    { top: '40%', left: '3%', size: 40, color: '#6BCB77', opacity: 0.04 },
  ],
};

// ══════════════════════════════════════════════════════════════
//  1. EmptyFavorites
// ══════════════════════════════════════════════════════════════

export function EmptyFavorites({ onAction, className }: VariantProps) {
  return (
    <EmptyState
      emoji={'\uD83D\uDC9B'}
      title="Start your collection!"
      subtitle="Tap the heart on anything you love"
      mascot={'\uD83D\uDC30'}
      bgColor="#FFFCE8"
      decorativeCircles={circlePresets.favorites}
      decorations={<FloatingHearts />}
      actionLabel="Browse Content"
      onAction={onAction}
      buttonGradient="linear-gradient(135deg, #FFD93D, #FFE66D)"
      buttonShadow="0 4px 16px rgba(255,217,61,0.3)"
      className={className}
    />
  );
}

// ══════════════════════════════════════════════════════════════
//  2. EmptyHistory
// ══════════════════════════════════════════════════════════════

export function EmptyHistory({ onAction, className }: VariantProps) {
  return (
    <EmptyState
      emoji={'\uD83D\uDD70\uFE0F'}
      title="Your adventure awaits!"
      subtitle="Start exploring to build your timeline"
      mascot={'\uD83E\uDD8A'}
      bgColor="#F3EFFE"
      decorativeCircles={circlePresets.history}
      decorations={<ClockMotif />}
      actionLabel="Start Exploring"
      onAction={onAction}
      buttonGradient="linear-gradient(135deg, #A78BFA, #C4AAFF)"
      buttonShadow="0 4px 16px rgba(167,139,250,0.3)"
      className={className}
    />
  );
}

// ══════════════════════════════════════════════════════════════
//  3. EmptySearchResults
// ══════════════════════════════════════════════════════════════

interface SearchVariantProps extends VariantProps {
  /** Suggested search terms for "Did you mean?" */
  suggestions?: string[];
  /** Popular items to suggest instead */
  popularItems?: Array<{ label: string; onSelect: () => void }>;
  /** Callback for "Browse All" secondary action */
  onBrowseAll?: () => void;
}

export function EmptySearchResults({
  onAction,
  onSecondaryAction,
  className,
  suggestions = [],
  popularItems = [],
  onBrowseAll,
}: SearchVariantProps) {
  return (
    <div className={className}>
      <EmptyState
        emoji={'\uD83D\uDD0D'}
        title="Nothing found!"
        subtitle="Try different words or browse categories"
        mascot={'\uD83E\uDD8A'}
        bgColor="#EDFAF8"
        decorativeCircles={circlePresets.search}
        decorations={<SearchPulse />}
        actionLabel="Clear Search"
        onAction={onAction}
        secondaryLabel={onBrowseAll ? 'Browse All' : undefined}
        onSecondaryAction={onBrowseAll ?? onSecondaryAction}
        buttonGradient="linear-gradient(135deg, #4ECDC4, #6FE0D9)"
        buttonShadow="0 4px 16px rgba(78,205,196,0.3)"
      />

      {/* Did you mean? suggestions */}
      {suggestions.length > 0 && (
        <motion.div
          className="mt-4 px-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-[13px] font-bold text-[#6B6B7B] mb-2">Did you mean?</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((s) => (
              <button
                key={s}
                className="px-3 py-1.5 rounded-full bg-white text-[13px] font-bold text-[#4ECDC4] border border-[#4ECDC4]/20 cursor-pointer"
                onClick={onAction}
              >
                {s}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Popular items */}
      {popularItems.length > 0 && (
        <motion.div
          className="mt-4 px-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-[13px] font-bold text-[#6B6B7B] mb-2">Try these instead:</p>
          <div className="flex flex-col gap-2">
            {popularItems.slice(0, 3).map((item) => (
              <button
                key={item.label}
                className="w-full text-left px-4 py-3 rounded-[14px] bg-white text-[15px] font-bold text-[#2D2D3A] border border-[#F0EAE0] cursor-pointer"
                style={{ boxShadow: '0 2px 8px rgba(45,45,58,0.04)' }}
                onClick={item.onSelect}
              >
                {item.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  4. EmptyOffline
// ══════════════════════════════════════════════════════════════

export function EmptyOffline({ onAction, className }: VariantProps) {
  return (
    <EmptyState
      emoji={'\uD83D\uDCE1'}
      title="You're offline"
      subtitle="Download packs to enjoy content anywhere"
      mascot={'\uD83E\uDD89'}
      bgColor="#FFF0F0"
      decorativeCircles={circlePresets.offline}
      decorations={<OfflineCloud />}
      actionLabel="View Downloads"
      onAction={onAction}
      className={className}
    />
  );
}

// ══════════════════════════════════════════════════════════════
//  5. EmptyDownloads
// ══════════════════════════════════════════════════════════════

export function EmptyDownloads({ onAction, className }: VariantProps) {
  return (
    <EmptyState
      emoji={'\uD83D\uDCE5'}
      title="No downloads yet"
      subtitle="Save content for trips and offline fun"
      mascot={'\uD83E\uDD81'}
      bgColor="#EDFAF8"
      decorativeCircles={circlePresets.downloads}
      actionLabel="Browse Content"
      onAction={onAction}
      buttonGradient="linear-gradient(135deg, #4ECDC4, #6FE0D9)"
      buttonShadow="0 4px 16px rgba(78,205,196,0.3)"
      className={className}
    />
  );
}

// ══════════════════════════════════════════════════════════════
//  6. EmptyBedtimeRoutine (dark variant)
// ══════════════════════════════════════════════════════════════

export function EmptyBedtimeRoutine({ onAction, className }: VariantProps) {
  return (
    <EmptyState
      emoji={'\uD83C\uDF19'}
      title="No bedtime routine yet"
      subtitle="Set up a calming wind-down routine"
      mascot={'\uD83E\uDD89'}
      bgColor="#1E2140"
      titleColor="#D4D4E8"
      subtitleColor="#7B7BA0"
      decorativeCircles={circlePresets.bedtime}
      decorations={<TwinklingStars />}
      actionLabel="Create Routine"
      onAction={onAction}
      buttonGradient="linear-gradient(135deg, #6366F1, #818CF8)"
      buttonShadow="0 4px 16px rgba(99,102,241,0.35)"
      className={className}
    />
  );
}

// ══════════════════════════════════════════════════════════════
//  7. EmptySchedule
// ══════════════════════════════════════════════════════════════

export function EmptySchedule({ onAction, className }: VariantProps) {
  return (
    <EmptyState
      emoji={'\uD83D\uDCC5'}
      title="Nothing scheduled"
      subtitle="Create a routine to stay on track"
      mascot={'\uD83E\uDD81'}
      bgColor="#FFF3EB"
      decorativeCircles={circlePresets.schedule}
      decorations={<ScheduleDashes />}
      actionLabel="Create Schedule"
      onAction={onAction}
      buttonGradient="linear-gradient(135deg, #FF8C42, #FFA366)"
      buttonShadow="0 4px 16px rgba(255,140,66,0.3)"
      className={className}
    />
  );
}

// ══════════════════════════════════════════════════════════════
//  8. EmptyMediaError
// ══════════════════════════════════════════════════════════════

export function EmptyMediaError({ onAction, className }: VariantProps) {
  return (
    <EmptyState
      emoji={'\uD83C\uDFAD'}
      title="Oops! Something went wrong"
      subtitle="This content isn't available right now"
      mascot={'\uD83E\uDD8A'}
      bgColor="#FFF0F0"
      decorativeCircles={circlePresets.mediaError}
      actionLabel="Try Again"
      onAction={onAction}
      secondaryLabel="Go Back"
      className={className}
    />
  );
}

// ══════════════════════════════════════════════════════════════
//  9. EmptyInbox
// ══════════════════════════════════════════════════════════════

export function EmptyInbox({ onAction, className }: VariantProps) {
  return (
    <EmptyState
      emoji={'\uD83D\uDCEC'}
      title="All caught up!"
      subtitle="No new messages"
      mascot={'\uD83D\uDC30'}
      bgColor="#EDFAEF"
      decorativeCircles={circlePresets.inbox}
      decorations={<InboxCheckmarks />}
      className={className}
      onAction={onAction}
    />
  );
}

// ══════════════════════════════════════════════════════════════
//  10. EmptyRewards
// ══════════════════════════════════════════════════════════════

export function EmptyRewards({ onAction, className }: VariantProps) {
  return (
    <EmptyState
      emoji={'\uD83C\uDFC6'}
      title="Earn your first star!"
      subtitle="Complete activities to unlock rewards"
      mascot={'\uD83E\uDD81'}
      bgColor="#FFF8E1"
      decorativeCircles={circlePresets.rewards}
      decorations={<FloatingSparkles />}
      actionLabel="Start an Activity"
      onAction={onAction}
      buttonGradient="linear-gradient(135deg, #FFD93D, #FFE470)"
      buttonShadow="0 4px 16px rgba(255,217,61,0.35)"
      className={className}
    />
  );
}

// ══════════════════════════════════════════════════════════════
//  11. EmptyFirstUse (celebration variant)
// ══════════════════════════════════════════════════════════════

export function EmptyFirstUse({ onAction, className }: VariantProps) {
  return (
    <EmptyState
      emoji={'\uD83C\uDF89'}
      title="Welcome aboard!"
      subtitle="Let's start your learning journey"
      mascot={'\uD83E\uDD81'}
      bgColor="#FFF8F0"
      decorativeCircles={circlePresets.firstUse}
      decorations={
        <>
          <ConfettiSparkles />
          {/* Waving mascot overlay with extra emphasis */}
          <motion.div
            className="absolute bottom-[8%] right-[8%] text-4xl pointer-events-none"
            aria-hidden="true"
            animate={{ rotate: [0, 14, -8, 14, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            {'\uD83D\uDC4B'}
          </motion.div>
        </>
      }
      actionLabel="Let's Go!"
      onAction={onAction}
      buttonGradient="linear-gradient(135deg, #FF6B6B, #A78BFA)"
      buttonShadow="0 6px 24px rgba(255,107,107,0.35)"
      className={className}
    />
  );
}
