import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const routeMap: Record<string, string> = {
  home: '/menu',
  abc: '/abc',
  numbers: '/numbers',
  colors: '/colors',
  shapes: '/shapes',
  animals: '/animals',
  quiz: '/quiz',
  games: '/games',
  stories: '/stories',
  videos: '/videos',
  lessons: '/lessons',
  coloring: '/coloring',
  movement: '/movement',
  cooking: '/cooking',
  audio: '/audio',
  bedtime: '/bedtime',
  emotions: '/emotions',
  explorer: '/explorer',
  collections: '/collections',
  settings: '/settings',
  rewards: '/rewards',
  dashboard: '/parent-dashboard',
  billing: '/billing',
  tips: '/parent-tips',
  help: '/help',
  privacy: '/privacy',
  inbox: '/inbox',
  routines: '/routines',
  scrapbook: '/scrapbook',
};

export function useDeepLink() {
  const navigate = useNavigate();

  const resolveDeepLink = useCallback(
    (link: string) => {
      // Parse link format: kidlearn://page/param or just page key
      let pageKey = link;
      let param = '';

      if (link.startsWith('kidlearn://')) {
        const path = link.replace('kidlearn://', '');
        const parts = path.split('/');
        pageKey = parts[0];
        param = parts[1] ?? '';
      } else if (link.startsWith('/')) {
        navigate(link);
        return;
      }

      const route = routeMap[pageKey];
      if (route) {
        navigate(param ? `${route}/${param}` : route);
      } else {
        navigate('/menu');
      }
    },
    [navigate]
  );

  const generateShareLink = useCallback(
    (page: string, param?: string): string => {
      const base = `kidlearn://${page}`;
      return param ? `${base}/${param}` : base;
    },
    []
  );

  return { resolveDeepLink, generateShareLink };
}
