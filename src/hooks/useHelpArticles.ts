import { useState, useMemo, useCallback } from 'react';
import { db } from '../db/database';
import { useApp } from '../context/AppContext';

export type HelpCategory = 'getting_started' | 'troubleshooting' | 'billing' | 'content' | 'accessibility' | 'account';

export interface HelpArticle {
  id: string;
  title: string;
  category: HelpCategory;
  body: string;
  emoji: string;
}

const articlesData: HelpArticle[] = [
  {
    id: 'help-001',
    title: 'How to Create a Profile',
    category: 'getting_started',
    body: 'When you first open Kids Learning Fun, you will see the Welcome screen. Tap "Create Profile" to set up a new learner. Enter your child\'s name, pick a fun avatar emoji, and optionally set their age and interests. Each profile tracks its own progress, stars, and badges independently.',
    emoji: '\u{1F464}',
  },
  {
    id: 'help-002',
    title: 'Navigating the App',
    category: 'getting_started',
    body: 'The Main Menu has 6 tabs at the bottom: Learn, Play, Create, Listen, Wellbeing, and Explore. Swipe between tabs or tap them directly. Each tab contains different activities suited for your child\'s learning journey. Use the back arrow in the top-left corner to return to previous screens.',
    emoji: '\u{1F9ED}',
  },
  {
    id: 'help-003',
    title: 'App Not Loading Properly',
    category: 'troubleshooting',
    body: 'If the app is not loading correctly, try these steps:\n\n1. Close the browser tab completely and reopen it\n2. Clear your browser cache for this site\n3. Check your internet connection (needed for first load)\n4. Try a different browser (Chrome or Safari recommended)\n5. If installed as PWA, try uninstalling and reinstalling\n\nThe app works offline after the first load, so most issues are related to the initial cache.',
    emoji: '\u{1F527}',
  },
  {
    id: 'help-004',
    title: 'Sound Not Working',
    category: 'troubleshooting',
    body: 'The app uses Web Audio API for sound effects and SpeechSynthesis for voice. If sounds are not playing:\n\n1. Check that your device volume is turned up\n2. Go to Settings and make sure Sound Effects is enabled\n3. For voice/speech, ensure Voice (Text-to-Speech) is enabled\n4. Some browsers require a user interaction before playing audio - tap anywhere on screen\n5. On iOS, make sure the Silent Mode switch is off',
    emoji: '\u{1F50A}',
  },
  {
    id: 'help-005',
    title: 'Understanding Subscription Plans',
    category: 'billing',
    body: 'Kids Learning Fun offers two plans:\n\nFree Plan: Access to basic content including letters, numbers, colors, and shapes. One player profile. Includes ads.\n\nPremium Plan: Access to ALL content, offline learning packs, up to 5 player profiles, no ads, advanced parent reports, and custom routines. Your subscription renews automatically each month.',
    emoji: '\u{1F4B3}',
  },
  {
    id: 'help-006',
    title: 'Managing Your Subscription',
    category: 'billing',
    body: 'To manage your subscription, go to Settings then Billing. Here you can:\n\n- View your current plan and next billing date\n- Upgrade from Free to Premium\n- Cancel your Premium subscription\n- View payment history\n\nIf you cancel, you will retain Premium access until the end of your current billing period.',
    emoji: '\u{1F4B0}',
  },
  {
    id: 'help-007',
    title: 'What Content Is Available',
    category: 'content',
    body: 'Kids Learning Fun includes 316+ learning activities across these categories:\n\n- Letters & Phonics\n- Numbers & Counting\n- Colors & Shapes\n- Animals & Nature\n- Stories & Audio\n- Games & Quizzes\n- Creative Arts\n- Movement & Dance\n- Cooking Adventures\n- Emotions & Wellbeing\n- Explorer Topics\n\nNew content is added regularly through collections and seasonal updates.',
    emoji: '\u{1F4DA}',
  },
  {
    id: 'help-008',
    title: 'Offline Mode',
    category: 'content',
    body: 'Kids Learning Fun is a Progressive Web App (PWA) that works offline after the first visit. All core content is cached automatically. Premium users can download additional offline packs for specific topics. To install the app on your home screen, use your browser\'s "Add to Home Screen" option.',
    emoji: '\u{1F4F4}',
  },
  {
    id: 'help-009',
    title: 'Accessibility Features',
    category: 'accessibility',
    body: 'We are committed to making learning accessible for all children. Our accessibility options include:\n\n- Reduced Motion: Simplifies animations for children who are sensitive to movement\n- Larger Text: Scales text to 115% for better readability\n- High Contrast: Adds darker borders and bolder text\n- Voice Support: Text-to-speech reads content aloud\n- Bedtime Mode: Dimmed interface for evening use\n\nFind these settings in the Settings page under Accessibility.',
    emoji: '\u{267F}',
  },
  {
    id: 'help-010',
    title: 'Deleting Your Account',
    category: 'account',
    body: 'To delete a player profile, go to Settings, scroll to the Danger Zone, and tap "Delete This Profile." This will permanently remove all progress, stars, badges, and saved content for that profile. This action cannot be undone.\n\nTo request deletion of all your data from our systems, go to Privacy Settings and use the "Delete My Data" option.',
    emoji: '\u{1F5D1}',
  },
  {
    id: 'help-011',
    title: 'Parent Dashboard Guide',
    category: 'getting_started',
    body: 'The Parent Dashboard gives you an overview of your child\'s learning journey. Access it from the Main Menu by tapping the chart icon. You will need to solve a simple math problem (parent gate) to enter.\n\nThe dashboard shows: total stars earned, streak days, weekly activity chart, category progress, recent achievements, game performance, mood check-in history, and personalized recommendations.',
    emoji: '\u{1F4CA}',
  },
  {
    id: 'help-012',
    title: 'Switching Between Profiles',
    category: 'account',
    body: 'To switch between player profiles, return to the Welcome screen by tapping the back arrow from the Main Menu or going to Settings. On the Welcome screen, you will see all created profiles. Tap on a different profile to switch. Each profile maintains its own independent progress and preferences.',
    emoji: '\u{1F465}',
  },
];

export function useHelpArticles() {
  const { currentPlayer } = useApp();
  const playerId = currentPlayer?.id;
  const [searchQuery, setSearchQuery] = useState('');

  const articles = useMemo(() => articlesData, []);

  const searchArticles = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (!query.trim()) return articlesData;
      const lower = query.toLowerCase();
      return articlesData.filter(
        (a) =>
          a.title.toLowerCase().includes(lower) ||
          a.body.toLowerCase().includes(lower) ||
          a.category.toLowerCase().includes(lower)
      );
    },
    []
  );

  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articlesData;
    const lower = searchQuery.toLowerCase();
    return articlesData.filter(
      (a) =>
        a.title.toLowerCase().includes(lower) ||
        a.body.toLowerCase().includes(lower)
    );
  }, [searchQuery]);

  const getArticle = useCallback((id: string) => {
    return articlesData.find((a) => a.id === id);
  }, []);

  const getArticlesByCategory = useCallback((category: HelpCategory) => {
    return articlesData.filter((a) => a.category === category);
  }, []);

  const submitFeedback = useCallback(
    async (articleId: string, helpful: boolean) => {
      if (!playerId) return;
      const existing = await db.helpFeedback
        .where('[playerId+articleId]')
        .equals([playerId, articleId])
        .first();
      if (existing) {
        await db.helpFeedback.update(existing.id!, { helpful, submittedAt: new Date() });
      } else {
        await db.helpFeedback.add({ playerId, articleId, helpful, submittedAt: new Date() });
      }
    },
    [playerId]
  );

  return {
    articles,
    filteredArticles,
    searchQuery,
    setSearchQuery,
    searchArticles,
    getArticle,
    getArticlesByCategory,
    submitFeedback,
  };
}
