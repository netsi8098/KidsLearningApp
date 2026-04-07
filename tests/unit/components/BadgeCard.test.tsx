import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { BadgeDefinition } from '../../../src/models/types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { initial, animate, exit, transition, whileHover, whileTap, ...rest } = props;
      return <div {...rest}>{children}</div>;
    },
  },
}));

import BadgeCard from '../../../src/components/BadgeCard';

const mockBadge: BadgeDefinition = {
  id: 'abc-master',
  name: 'ABC Master',
  emoji: '🔤',
  description: 'Learn all 26 letters',
  category: 'abc',
  threshold: 26,
};

describe('BadgeCard', () => {
  it('renders badge emoji and name', () => {
    render(<BadgeCard badge={mockBadge} earned={false} />);
    expect(screen.getByText('🔤')).toBeInTheDocument();
    expect(screen.getByText('ABC Master')).toBeInTheDocument();
  });

  it('renders badge description', () => {
    render(<BadgeCard badge={mockBadge} earned={false} />);
    expect(screen.getByText('Learn all 26 letters')).toBeInTheDocument();
  });

  it('shows "Earned" label when earned is true', () => {
    render(<BadgeCard badge={mockBadge} earned={true} />);
    expect(screen.getByText('Earned')).toBeInTheDocument();
  });

  it('shows "Unlocked!" text when earned is true', () => {
    render(<BadgeCard badge={mockBadge} earned={true} />);
    expect(screen.getByText('Unlocked!')).toBeInTheDocument();
  });

  it('does not show "Earned" or "Unlocked!" when not earned', () => {
    render(<BadgeCard badge={mockBadge} earned={false} />);
    expect(screen.queryByText('Earned')).not.toBeInTheDocument();
    expect(screen.queryByText('Unlocked!')).not.toBeInTheDocument();
  });

  it('applies grayscale to emoji when not earned', () => {
    render(<BadgeCard badge={mockBadge} earned={false} />);
    const emojiSpan = screen.getByText('🔤');
    expect(emojiSpan.className).toContain('grayscale');
    expect(emojiSpan.className).toContain('opacity-60');
  });

  it('does not apply grayscale to emoji when earned', () => {
    render(<BadgeCard badge={mockBadge} earned={true} />);
    const emojiSpan = screen.getByText('🔤');
    expect(emojiSpan.className).not.toContain('grayscale');
  });

  it('renders progress bar when progress and total are provided and badge is not earned', () => {
    const { container } = render(
      <BadgeCard badge={mockBadge} earned={false} progress={7} total={10} />
    );
    const progressTrack = container.querySelector('.bg-\\[\\#F0EAE0\\].rounded-full.h-2');
    expect(progressTrack).toBeInTheDocument();
  });

  it('does not render progress bar when badge is earned', () => {
    const { container } = render(
      <BadgeCard badge={mockBadge} earned={true} progress={10} total={10} />
    );
    const progressTrack = container.querySelector('.bg-\\[\\#F0EAE0\\].rounded-full.h-2');
    expect(progressTrack).not.toBeInTheDocument();
  });

  it('renders hint text when provided with progress', () => {
    render(
      <BadgeCard badge={mockBadge} earned={false} progress={7} total={10} hint="7/10 letters learned" />
    );
    expect(screen.getByText('7/10 letters learned')).toBeInTheDocument();
  });
});
