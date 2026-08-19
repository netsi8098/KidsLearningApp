/**
 * ShelfSurface — the world-native ledge the player cards rest on.
 *
 * In the reference art the cards are never floating over scenery: they sit on a
 * grass bank, a wooden deck, a stone riverbank or a cloud shelf, with contact
 * shadows tying them to it. This renders that surface per theme so the shelf
 * reads as part of the world rather than a translucent panel laid over it.
 *
 * Purely decorative — it sits behind the cards and never takes pointer events.
 */
import { motion } from 'framer-motion';
import { useMotionPreset } from '../../motion/useMotionPreset';

export default function ShelfSurface({ themeId }: { themeId: string }) {
  const { isReducedMotion } = useMotionPreset();

  if (themeId === 'treehouse') {
    return (
      <div className="absolute inset-x-0 bottom-0 top-[-14px] pointer-events-none" aria-hidden="true">
        {/* Wooden deck: front edge board + plank seams */}
        {/* Deck boards running front-to-back, so the surface reads as timber
            rather than a flat tan band. */}
        <div
          className="absolute inset-x-0 bottom-0 top-2"
          style={{
            background:
              'repeating-linear-gradient(90deg, #B98A57 0px, #B98A57 62px, #A9773D 62px, #A9773D 64px, #B08048 64px, #B08048 126px, #9C6C36 126px, #9C6C36 128px)',
            boxShadow: 'inset 0 4px 0 rgba(255,255,255,0.16), inset 0 -12px 20px rgba(0,0,0,0.3), 0 -10px 28px rgba(0,0,0,0.3)',
          }}
        />
        {/* Front lip catching the lantern light */}
        <div className="absolute inset-x-0 bottom-0 h-[10px]" style={{ background: 'linear-gradient(180deg,#8A6440,#5C4229)' }} />
        <div className="absolute inset-x-0 top-2 h-[3px]" style={{ background: 'rgba(255,225,180,0.32)' }} />
      </div>
    );
  }

  if (themeId === 'sky-islands') {
    return (
      <div className="absolute inset-x-0 bottom-0 top-[-26px] pointer-events-none" aria-hidden="true">
        {/* Cloud shelf: soft billows the cards nestle into */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none" fill="none">
          <path d="M0 120 L0 46 Q30 20 66 34 Q104 12 146 30 Q192 6 238 28 Q286 8 330 30 Q368 18 400 42 L400 120 Z" fill="#EDE9FC" opacity="0.92" />
          <path d="M0 120 L0 70 Q56 48 118 64 Q186 82 250 62 Q318 42 400 66 L400 120 Z" fill="#DCD5F5" opacity="0.9" />
        </svg>
        {[12, 34, 58, 82].map((p, i) => (
          <motion.span
            key={p}
            className="absolute rounded-full"
            style={{ left: `${p}%`, top: 6, width: 26, height: 26, background: 'rgba(255,255,255,0.75)', filter: 'blur(5px)' }}
            animate={isReducedMotion ? undefined : { y: [0, -4, 0], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4 + i * 0.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
          />
        ))}
      </div>
    );
  }

  if (themeId === 'river-garden') {
    return (
      <div className="absolute inset-x-0 bottom-0 top-[-18px] pointer-events-none" aria-hidden="true">
        {/* Stone riverbank ledge with a wet lip catching the light */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none" fill="none">
          <path d="M0 120 L0 40 Q48 22 104 34 Q166 48 226 30 Q292 12 400 34 L400 120 Z" fill="#6FA86A" />
          <path d="M0 120 L0 62 Q70 44 148 58 Q228 72 400 54 L400 120 Z" fill="#5A9257" />
          <path d="M0 46 Q48 28 104 40 Q166 54 226 36 Q292 18 400 40" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" fill="none" />
        </svg>
        {[
          { l: '8%', w: 34 }, { l: '46%', w: 26 }, { l: '78%', w: 30 },
        ].map((s) => (
          <span
            key={s.l}
            className="absolute rounded-full"
            style={{ left: s.l, top: 10, width: s.w, height: s.w * 0.45, background: 'rgba(190,196,186,0.75)', boxShadow: 'inset 0 -2px 3px rgba(0,0,0,0.18)' }}
          />
        ))}
      </div>
    );
  }

  // sunny-meadow (and any future daylight world): grass bank with blade fringe
  return (
    <div className="absolute inset-x-0 bottom-0 top-[-18px] pointer-events-none" aria-hidden="true">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none" fill="none">
        <path d="M0 120 L0 38 Q52 18 110 32 Q172 48 232 28 Q298 8 400 32 L400 120 Z" fill="#63BC4D" />
        <path d="M0 120 L0 62 Q72 42 148 58 Q226 74 400 52 L400 120 Z" fill="#54A840" />
      </svg>
      {/* Blade fringe so the cards look bedded into the grass, not stacked on it */}
      <svg className="absolute inset-x-0 top-1 h-4 w-full" viewBox="0 0 400 16" preserveAspectRatio="none" fill="none">
        <path d="M0 16 L6 5 L12 16 L20 7 L27 16 L36 4 L44 16 L53 8 L61 16 L70 3 L79 16 L88 7 L96 16 L106 5 L115 16 L125 8 L134 16 L144 4 L153 16 L163 7 L172 16 L182 5 L191 16 L201 8 L210 16 L220 3 L229 16 L239 7 L248 16 L258 5 L267 16 L277 8 L286 16 L296 4 L305 16 L315 7 L324 16 L334 5 L343 16 L353 8 L362 16 L372 4 L381 16 L391 7 L400 16 Z" fill="#63BC4D" />
      </svg>
    </div>
  );
}
