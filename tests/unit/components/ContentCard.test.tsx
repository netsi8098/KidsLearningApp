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
  },
}));

import ContentCard from '../../../src/components/ContentCard';

describe('ContentCard', () => {
  const defaultProps = {
    emoji: '🔤',
    title: 'Learn ABCs',
  };

  it('renders emoji and title', () => {
    render(<ContentCard {...defaultProps} />);
    expect(screen.getByText('🔤')).toBeInTheDocument();
    expect(screen.getByText('Learn ABCs')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<ContentCard {...defaultProps} subtitle="Master the alphabet" />);
    expect(screen.getByText('Master the alphabet')).toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () => {
    render(<ContentCard {...defaultProps} />);
    expect(screen.queryByText('Master the alphabet')).not.toBeInTheDocument();
  });

  it('renders category badge when provided', () => {
    render(<ContentCard {...defaultProps} categoryBadge="Learning" />);
    expect(screen.getByText('Learning')).toBeInTheDocument();
  });

  it('renders content badges (New, Popular, Editor\'s Pick)', () => {
    render(<ContentCard {...defaultProps} badges={['new', 'popular']} />);
    expect(screen.getByText('New')).toBeInTheDocument();
    expect(screen.getByText('Popular')).toBeInTheDocument();
  });

  it('shows lock overlay when locked is true', () => {
    render(<ContentCard {...defaultProps} locked={true} />);
    expect(screen.getByText('🔒')).toBeInTheDocument();
  });

  it('does not show lock overlay when locked is false', () => {
    render(<ContentCard {...defaultProps} locked={false} />);
    expect(screen.queryByText('🔒')).not.toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    const onClick = vi.fn();
    render(<ContentCard {...defaultProps} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders progress bar when progress is provided', () => {
    const { container } = render(<ContentCard {...defaultProps} progress={65} />);
    // The progress bar container uses bg-[#F0EAE0] class
    const progressTrack = container.querySelector('.bg-\\[\\#F0EAE0\\].rounded-full.h-2');
    expect(progressTrack).toBeInTheDocument();
  });

  it('does not render progress bar when progress is not provided', () => {
    const { container } = render(<ContentCard {...defaultProps} />);
    const progressTrack = container.querySelector('.bg-\\[\\#F0EAE0\\].rounded-full.h-2');
    expect(progressTrack).not.toBeInTheDocument();
  });
});
