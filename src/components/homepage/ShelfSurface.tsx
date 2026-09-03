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
    // The painted backplate already contains a perspective-correct patio.
    // Adding another generated plank wall here hid that patio and made the
    // controls look detached from the scene.
    return null;
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

  // Sunny Meadow already has a painted foreground. A quiet contact veil gives
  // the cards separation without covering that artwork with a flat green band.
  return (
    <div className="absolute inset-x-0 bottom-0 top-[-18px] pointer-events-none" aria-hidden="true">
      <div
        className="absolute inset-x-0 bottom-0 h-full"
        style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(43,104,45,0.05) 42%, rgba(31,74,38,0.16) 100%)' }}
      />
    </div>
  );
}
