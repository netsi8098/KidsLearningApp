import type { ReactNode } from 'react';

/**
 * Every world is a live scene, not a backdrop. It receives the mascot and the
 * title as slots so it can seat them on its own terrain: the mascot stands on
 * the world's stage and the title straddles that stage's front edge, exactly
 * as in the art direction. `children` carries the remaining interface.
 */
export interface WorldProps {
  /** The character, placed standing on this world's stage. */
  mascot: ReactNode;
  /** Title treatment, seated against the stage. */
  title: ReactNode;
  /** Top controls and the player-card shelf. */
  children: ReactNode;
}
