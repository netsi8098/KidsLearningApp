export interface SeasonalTheme {
  id: string;
  name: string;
  emoji: string;
  color: string;
  startMonth: number;
  endMonth: number;
  bannerMessage: string;
  featuredContentIds: string[];
}

export const seasonalThemes: SeasonalTheme[] = [
  {
    id: 'spring',
    name: 'Spring Bloom',
    emoji: '🌸',
    color: '#6BCB77',
    startMonth: 3,
    endMonth: 5,
    bannerMessage: 'Spring is here! Explore nature and growth!',
    featuredContentIds: ['s-4-nat-1', 'l-colors', 'l-animals'],
  },
  {
    id: 'summer',
    name: 'Summer Fun',
    emoji: '☀️',
    color: '#FFD93D',
    startMonth: 6,
    endMonth: 8,
    bannerMessage: 'Summer adventures await! Stay active and learn!',
    featuredContentIds: ['s-4-adv-1'],
  },
  {
    id: 'back-to-school',
    name: 'Back to School',
    emoji: '🎒',
    color: '#74B9FF',
    startMonth: 9,
    endMonth: 9,
    bannerMessage: 'Time to learn! Let\'s get ready for school!',
    featuredContentIds: ['l-abc', 'l-numbers'],
  },
  {
    id: 'fall',
    name: 'Autumn Colors',
    emoji: '🍂',
    color: '#FF8C42',
    startMonth: 10,
    endMonth: 11,
    bannerMessage: 'Fall colors are beautiful! Learn about seasons!',
    featuredContentIds: [],
  },
  {
    id: 'holidays',
    name: 'Holiday Magic',
    emoji: '🎄',
    color: '#FF6B6B',
    startMonth: 12,
    endMonth: 12,
    bannerMessage: 'Happy holidays! Spread joy and kindness!',
    featuredContentIds: [],
  },
  {
    id: 'winter',
    name: 'Winter Wonderland',
    emoji: '❄️',
    color: '#A78BFA',
    startMonth: 1,
    endMonth: 2,
    bannerMessage: 'Brrr! Let\'s learn about winter and stay cozy!',
    featuredContentIds: [],
  },
];

export function getActiveTheme(): SeasonalTheme {
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const match = seasonalThemes.find(
    (theme) => currentMonth >= theme.startMonth && currentMonth <= theme.endMonth
  );
  // Fallback to spring if no match found (should not happen with full coverage)
  return match ?? seasonalThemes[0];
}
