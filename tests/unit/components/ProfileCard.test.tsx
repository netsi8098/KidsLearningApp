import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, whileHover, whileTap, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
    button: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, whileHover, whileTap, ...rest } = props;
      return <button {...rest}>{children}</button>;
    },
    span: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, whileHover, whileTap, ...rest } = props;
      return <span {...rest}>{children}</span>;
    },
    circle: (props: any) => {
      const { initial, animate, exit, transition, ...rest } = props;
      return <circle {...rest} />;
    },
  },
}));

import ProfileCard from '../../../src/components/ProfileCard';

describe('ProfileCard', () => {
  const defaultProps = {
    name: 'Luna',
    emoji: '🦄',
    color: '#FF6B6B',
  };

  it('renders the profile name', () => {
    render(<ProfileCard {...defaultProps} />);
    expect(screen.getByText('Luna')).toBeInTheDocument();
  });

  it('renders the emoji', () => {
    render(<ProfileCard {...defaultProps} />);
    expect(screen.getByText('🦄')).toBeInTheDocument();
  });

  it('renders age badge when age is provided', () => {
    render(<ProfileCard {...defaultProps} age={5} />);
    expect(screen.getByText('Age 5')).toBeInTheDocument();
  });

  it('does not render age badge when age is not provided', () => {
    render(<ProfileCard {...defaultProps} />);
    expect(screen.queryByText(/^Age/)).not.toBeInTheDocument();
  });

  it('displays total star count', () => {
    render(<ProfileCard {...defaultProps} totalStars={42} />);
    // The star count is rendered as "⭐ 42" inside a single <span>
    expect(screen.getByText(/42/)).toBeInTheDocument();
  });

  it('displays default star count of 0 when totalStars is not provided', () => {
    render(<ProfileCard {...defaultProps} />);
    // The star count is rendered as "⭐ 0" inside a single <span>
    expect(screen.getByText(/⭐\s+0/)).toBeInTheDocument();
  });

  it('shows "Last played" badge when isLastUsed is true', () => {
    render(<ProfileCard {...defaultProps} isLastUsed={true} />);
    expect(screen.getByText('Last played')).toBeInTheDocument();
  });

  it('does not show "Last played" badge when isLastUsed is false', () => {
    render(<ProfileCard {...defaultProps} isLastUsed={false} />);
    expect(screen.queryByText('Last played')).not.toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn();
    render(<ProfileCard {...defaultProps} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('renders correct level label based on totalStars', () => {
    // 0 stars = Level 1 "Starter"
    const { rerender } = render(<ProfileCard {...defaultProps} totalStars={0} />);
    expect(screen.getByText('Lv.1 Starter')).toBeInTheDocument();

    // 20 stars = Level 2 "Explorer"
    rerender(<ProfileCard {...defaultProps} totalStars={20} />);
    expect(screen.getByText('Lv.2 Explorer')).toBeInTheDocument();

    // 50 stars = Level 3 "Achiever"
    rerender(<ProfileCard {...defaultProps} totalStars={50} />);
    expect(screen.getByText('Lv.3 Achiever')).toBeInTheDocument();

    // 100 stars = Level 4 "Champion"
    rerender(<ProfileCard {...defaultProps} totalStars={100} />);
    expect(screen.getByText('Lv.4 Champion')).toBeInTheDocument();

    // 200 stars = Level 5 "Master"
    rerender(<ProfileCard {...defaultProps} totalStars={200} />);
    expect(screen.getByText('Lv.5 Master')).toBeInTheDocument();
  });
});
