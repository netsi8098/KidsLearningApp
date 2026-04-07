export interface DailyGoal {
  key: 'lessons' | 'games' | 'stories' | 'videos';
  label: string;
  emoji: string;
  target: number;
  color: string;
}

export const dailyGoals: DailyGoal[] = [
  { key: 'lessons', label: 'Lessons', emoji: '📚', target: 2, color: '#FF6B6B' },
  { key: 'games', label: 'Games', emoji: '🎮', target: 3, color: '#4ECDC4' },
  { key: 'stories', label: 'Stories', emoji: '📖', target: 1, color: '#A78BFA' },
  { key: 'videos', label: 'Videos', emoji: '🎬', target: 2, color: '#FFB347' },
];

export const unlockableAvatars = [
  // Free avatars (always available)
  { emoji: '🦁', name: 'Lion', cost: 0 },
  { emoji: '🐱', name: 'Cat', cost: 0 },
  { emoji: '🐶', name: 'Dog', cost: 0 },
  { emoji: '🐰', name: 'Bunny', cost: 0 },
  { emoji: '🦊', name: 'Fox', cost: 0 },
  { emoji: '🐼', name: 'Panda', cost: 0 },
  // Unlockable with stars
  { emoji: '🦄', name: 'Unicorn', cost: 20 },
  { emoji: '🐉', name: 'Dragon', cost: 30 },
  { emoji: '🦋', name: 'Butterfly', cost: 15 },
  { emoji: '🦜', name: 'Parrot', cost: 25 },
  { emoji: '🐬', name: 'Dolphin', cost: 35 },
  { emoji: '🦅', name: 'Eagle', cost: 40 },
  { emoji: '🐺', name: 'Wolf', cost: 50 },
  { emoji: '🦈', name: 'Shark', cost: 45 },
  { emoji: '🌈', name: 'Rainbow', cost: 60 },
  { emoji: '🚀', name: 'Rocket', cost: 75 },
];

export function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export function getGoalProgress(completed: number, target: number): { percent: number; done: boolean } {
  const percent = Math.min(100, Math.round((completed / target) * 100));
  return { percent, done: completed >= target };
}
