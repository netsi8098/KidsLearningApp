// ── Time-of-Day Configuration ───────────────────────────
// 5 auto-detected modes that adjust content recommendations.

import type { TimeModeConfig, TimeMode } from './types';

export const timeModes: TimeModeConfig[] = [
  {
    id: 'morning',
    label: 'Good Morning',
    emoji: '🌅',
    hoursStart: 6,
    hoursEnd: 9,
    preferredTags: ['energy:high', 'mood:energetic', 'skill:physical'],
    excludedTags: ['bedtime-friendly'],
    bgClass: 'bg-amber-50',
  },
  {
    id: 'learning',
    label: 'Learning Time',
    emoji: '📚',
    hoursStart: 9,
    hoursEnd: 12,
    preferredTags: ['skill:literacy', 'skill:math', 'skill:science', 'mood:curious'],
    excludedTags: [],
    bgClass: 'bg-sky-50',
  },
  {
    id: 'break',
    label: 'Break Time',
    emoji: '🎮',
    hoursStart: 12,
    hoursEnd: 15,
    preferredTags: ['mood:playful', 'screen:interactive', 'theme:food'],
    excludedTags: [],
    bgClass: 'bg-green-50',
  },
  {
    id: 'quiet',
    label: 'Quiet Time',
    emoji: '🧘',
    hoursStart: 15,
    hoursEnd: 18,
    preferredTags: ['energy:calm', 'mood:creative', 'mood:calm', 'skill:creativity'],
    excludedTags: ['energy:high'],
    bgClass: 'bg-purple-50',
  },
  {
    id: 'bedtime',
    label: 'Bedtime',
    emoji: '🌙',
    hoursStart: 18,
    hoursEnd: 6,
    preferredTags: ['bedtime-friendly', 'mood:calm', 'energy:calm'],
    excludedTags: ['energy:high', 'mood:energetic'],
    bgClass: 'bg-indigo-950',
  },
];

/** Get the current auto-detected time mode based on hour */
export function getAutoTimeMode(): TimeMode {
  const hour = new Date().getHours();

  for (const mode of timeModes) {
    if (mode.id === 'bedtime') {
      // Bedtime wraps around midnight: 18-6
      if (hour >= mode.hoursStart || hour < mode.hoursEnd) return mode.id;
    } else {
      if (hour >= mode.hoursStart && hour < mode.hoursEnd) return mode.id;
    }
  }

  return 'learning'; // fallback
}

/** Get the config for a specific time mode */
export function getTimeModeConfig(mode: TimeMode): TimeModeConfig {
  return timeModes.find((m) => m.id === mode) ?? timeModes[1]; // default to 'learning'
}

/** Get the current time mode config */
export function getCurrentTimeModeConfig(): TimeModeConfig {
  return getTimeModeConfig(getAutoTimeMode());
}
