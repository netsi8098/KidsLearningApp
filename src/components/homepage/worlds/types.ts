import type { MutableRefObject, ReactNode } from 'react';
import type { LionBrain } from '../world3d/lionBrain';

/**
 * Every world is a live scene, not a backdrop. It receives the mascot and the
 * title as slots so it can seat them on its own terrain: the mascot stands on
 * the world's stage and the title straddles that stage's front edge, exactly
 * as in the art direction. `children` carries the remaining interface.
 */
export interface WorldProps {
  /** The character, placed standing on this world's stage. */
  mascot: ReactNode;
  /**
   * Replacement for `mascot` used ONLY when a world renders its character as
   * real geometry in the scene. Suppressing the DOM mascot by theme id instead
   * was a bug: when the 3D world fell back to its painted twin (no WebGL), the
   * page had already stripped the mascot and the fallback rendered with no
   * character at all. The world itself is the only thing that knows which path
   * it took, so it makes the choice.
   */
  mascotInScene?: ReactNode;
  /** Title treatment, seated against the stage. */
  title: ReactNode;
  /** Top controls and the player-card shelf. */
  children: ReactNode;
  /**
   * Handle to a live 3D character, when the world has one. Painted worlds
   * ignore it; the 3D world uses it so the page can command the lion (greet,
   * celebrate) through the same call sites as the 2D mascot.
   */
  brainRef?: MutableRefObject<LionBrain | null>;
}
