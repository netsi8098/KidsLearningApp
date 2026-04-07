import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, whileHover, whileTap, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
    span: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, whileHover, whileTap, ...rest } = props;
      return <span {...rest}>{children}</span>;
    },
  },
}));

// Mock useApp context
const mockUseApp = vi.fn();
vi.mock('../../../src/context/AppContext', () => ({
  useApp: () => mockUseApp(),
}));

// Mock dexie-react-hooks
const mockUseLiveQuery = vi.fn();
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: (...args: any[]) => mockUseLiveQuery(...args),
}));

// Mock database
vi.mock('../../../src/db/database', () => ({
  db: {
    profiles: {
      get: vi.fn(),
    },
  },
}));

import StarCounter from '../../../src/components/StarCounter';

describe('StarCounter', () => {
  beforeEach(() => {
    mockUseApp.mockReturnValue({ currentPlayer: { id: 1 } });
  });

  it('renders star emoji', () => {
    mockUseLiveQuery.mockReturnValue({ totalStars: 42 });
    render(<StarCounter />);
    expect(screen.getByText('⭐')).toBeInTheDocument();
  });

  it('displays the star count from profile', () => {
    mockUseLiveQuery.mockReturnValue({ totalStars: 42 });
    render(<StarCounter />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('displays 0 when profile has no stars', () => {
    mockUseLiveQuery.mockReturnValue({ totalStars: 0 });
    render(<StarCounter />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('displays 0 when profile is undefined', () => {
    mockUseLiveQuery.mockReturnValue(undefined);
    render(<StarCounter />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('displays large star counts', () => {
    mockUseLiveQuery.mockReturnValue({ totalStars: 1500 });
    render(<StarCounter />);
    expect(screen.getByText('1500')).toBeInTheDocument();
  });

  it('renders with correct visual styling', () => {
    mockUseLiveQuery.mockReturnValue({ totalStars: 10 });
    const { container } = render(<StarCounter />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('rounded-full');
    expect(wrapper.className).toContain('flex');
    expect(wrapper.className).toContain('items-center');
  });
});
