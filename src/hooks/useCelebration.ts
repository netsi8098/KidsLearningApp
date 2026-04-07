import { useApp } from '../context/AppContext';

export function useCelebration() {
  const { celebrationVisible, showCelebration, hideCelebration, starBurstVisible, showStarBurst } =
    useApp();

  return { celebrationVisible, showCelebration, hideCelebration, starBurstVisible, showStarBurst };
}
