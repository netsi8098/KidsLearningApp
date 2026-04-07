import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useDeepLink } from '../../../src/hooks/useDeepLink';

const { mockNavigate } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function wrapper({ children }: { children: ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>;
}

describe('useDeepLink', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('resolveDeepLink', () => {
    describe('kidlearn:// protocol', () => {
      it('navigates to the correct route for a known page', () => {
        const { result } = renderHook(() => useDeepLink(), { wrapper });

        act(() => {
          result.current.resolveDeepLink('kidlearn://abc');
        });

        expect(mockNavigate).toHaveBeenCalledWith('/abc');
      });

      it('navigates to /menu for the home page key', () => {
        const { result } = renderHook(() => useDeepLink(), { wrapper });

        act(() => {
          result.current.resolveDeepLink('kidlearn://home');
        });

        expect(mockNavigate).toHaveBeenCalledWith('/menu');
      });

      it('navigates with param appended to route', () => {
        const { result } = renderHook(() => useDeepLink(), { wrapper });

        act(() => {
          result.current.resolveDeepLink('kidlearn://collections/nature');
        });

        expect(mockNavigate).toHaveBeenCalledWith('/collections/nature');
      });

      it('falls back to /menu for unknown page in protocol', () => {
        const { result } = renderHook(() => useDeepLink(), { wrapper });

        act(() => {
          result.current.resolveDeepLink('kidlearn://unknownpage');
        });

        expect(mockNavigate).toHaveBeenCalledWith('/menu');
      });

      it('handles empty path after protocol', () => {
        const { result } = renderHook(() => useDeepLink(), { wrapper });

        act(() => {
          result.current.resolveDeepLink('kidlearn://');
        });

        // Empty string is the page key after stripping protocol
        expect(mockNavigate).toHaveBeenCalledWith('/menu');
      });
    });

    describe('direct path navigation', () => {
      it('navigates directly for paths starting with /', () => {
        const { result } = renderHook(() => useDeepLink(), { wrapper });

        act(() => {
          result.current.resolveDeepLink('/some-custom-path');
        });

        expect(mockNavigate).toHaveBeenCalledWith('/some-custom-path');
      });

      it('navigates directly for /menu path', () => {
        const { result } = renderHook(() => useDeepLink(), { wrapper });

        act(() => {
          result.current.resolveDeepLink('/menu');
        });

        expect(mockNavigate).toHaveBeenCalledWith('/menu');
      });
    });

    describe('page key lookup (bare key)', () => {
      it('navigates to route for known bare page key', () => {
        const { result } = renderHook(() => useDeepLink(), { wrapper });

        act(() => {
          result.current.resolveDeepLink('settings');
        });

        expect(mockNavigate).toHaveBeenCalledWith('/settings');
      });

      it('falls back to /menu for invalid bare page key', () => {
        const { result } = renderHook(() => useDeepLink(), { wrapper });

        act(() => {
          result.current.resolveDeepLink('invalidkey');
        });

        expect(mockNavigate).toHaveBeenCalledWith('/menu');
      });

      it('maps dashboard to /parent-dashboard', () => {
        const { result } = renderHook(() => useDeepLink(), { wrapper });

        act(() => {
          result.current.resolveDeepLink('dashboard');
        });

        expect(mockNavigate).toHaveBeenCalledWith('/parent-dashboard');
      });
    });

    describe('route map coverage', () => {
      const expectedRouteMap: Record<string, string> = {
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

      it('covers all 29 route mappings', () => {
        const { result } = renderHook(() => useDeepLink(), { wrapper });

        Object.entries(expectedRouteMap).forEach(([key, route]) => {
          mockNavigate.mockClear();
          act(() => {
            result.current.resolveDeepLink(`kidlearn://${key}`);
          });
          expect(mockNavigate).toHaveBeenCalledWith(route);
        });
      });
    });
  });

  describe('generateShareLink', () => {
    it('creates kidlearn:// format without param', () => {
      const { result } = renderHook(() => useDeepLink(), { wrapper });

      const link = result.current.generateShareLink('abc');
      expect(link).toBe('kidlearn://abc');
    });

    it('creates kidlearn:// format with param', () => {
      const { result } = renderHook(() => useDeepLink(), { wrapper });

      const link = result.current.generateShareLink('collections', 'nature');
      expect(link).toBe('kidlearn://collections/nature');
    });

    it('handles empty page string', () => {
      const { result } = renderHook(() => useDeepLink(), { wrapper });

      const link = result.current.generateShareLink('');
      expect(link).toBe('kidlearn://');
    });

    it('creates link for home page', () => {
      const { result } = renderHook(() => useDeepLink(), { wrapper });

      const link = result.current.generateShareLink('home');
      expect(link).toBe('kidlearn://home');
    });
  });
});
