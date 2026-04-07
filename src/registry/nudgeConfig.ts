// ── Nudge Configuration ─────────────────────────────────
// Friendly, non-pushy nudge rules with conditions and messaging.

import type { NudgeRule } from './types';

export const nudgeRules: NudgeRule[] = [
  {
    id: 'inactive-3-days',
    emoji: '🌟',
    condition: 'inactive-3-days',
    message: "We miss you! There are fun new things to explore.",
    actionRoute: '/menu',
    actionLabel: 'Jump back in',
    priority: 90,
  },
  {
    id: 'streak-at-risk',
    emoji: '🔥',
    condition: 'streak-at-risk',
    message: "Don't lose your streak! Just one quick activity today.",
    actionRoute: '/menu',
    actionLabel: 'Keep it going',
    priority: 85,
  },
  {
    id: 'new-content',
    emoji: '✨',
    condition: 'new-content-available',
    message: "New activities just landed! Check them out.",
    actionRoute: '/discover',
    actionLabel: 'See what\'s new',
    priority: 70,
  },
  {
    id: 'incomplete-collection',
    emoji: '📦',
    condition: 'incomplete-collection',
    message: "You're so close to finishing a collection! Keep going.",
    actionRoute: '/collections',
    actionLabel: 'Continue collection',
    priority: 75,
  },
  {
    id: 'skill-gap',
    emoji: '🧠',
    condition: 'skill-gap',
    message: "Try something new! There are skills you haven't explored yet.",
    actionRoute: '/discover',
    actionLabel: 'Explore new skills',
    priority: 60,
  },
  {
    id: 'weekly-recap-ready',
    emoji: '📊',
    condition: 'weekly-recap-ready',
    message: "Your weekly learning recap is ready!",
    actionRoute: '/weekly-recap',
    actionLabel: 'View recap',
    priority: 50,
  },
];
