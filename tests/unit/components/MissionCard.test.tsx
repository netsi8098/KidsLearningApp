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

import MissionCard from '../../../src/components/MissionCard';

describe('MissionCard', () => {
  const defaultProps = {
    emoji: '📖',
    description: 'Read 3 stories',
    completed: false,
    onTap: vi.fn(),
  };

  beforeEach(() => {
    defaultProps.onTap.mockClear();
  });

  it('renders mission emoji and description', () => {
    render(<MissionCard {...defaultProps} />);
    expect(screen.getByText('📖')).toBeInTheDocument();
    expect(screen.getByText('Read 3 stories')).toBeInTheDocument();
  });

  it('shows "Start" button when not completed', () => {
    render(<MissionCard {...defaultProps} completed={false} />);
    expect(screen.getByText('Start')).toBeInTheDocument();
  });

  it('shows reward stars when not completed', () => {
    render(<MissionCard {...defaultProps} completed={false} rewardStars={10} />);
    expect(screen.getByText('+10 Stars')).toBeInTheDocument();
  });

  it('shows default reward stars of 5 when not specified', () => {
    render(<MissionCard {...defaultProps} completed={false} />);
    expect(screen.getByText('+5 Stars')).toBeInTheDocument();
  });

  it('shows "Done!" text when completed', () => {
    render(<MissionCard {...defaultProps} completed={true} />);
    expect(screen.getByText('Done!')).toBeInTheDocument();
  });

  it('shows checkmark when completed', () => {
    render(<MissionCard {...defaultProps} completed={true} />);
    // The checkmark is rendered as unicode char in the completion indicator
    const checkmarks = screen.getAllByText('\u2713');
    expect(checkmarks.length).toBeGreaterThanOrEqual(1);
  });

  it('does not show "Start" button when completed', () => {
    render(<MissionCard {...defaultProps} completed={true} />);
    expect(screen.queryByText('Start')).not.toBeInTheDocument();
  });

  it('calls onTap when clicked', () => {
    render(<MissionCard {...defaultProps} />);
    fireEvent.click(screen.getByRole('button'));
    expect(defaultProps.onTap).toHaveBeenCalledTimes(1);
  });

  it('applies strikethrough text style when completed', () => {
    render(<MissionCard {...defaultProps} completed={true} />);
    const description = screen.getByText('Read 3 stories');
    expect(description.className).toContain('line-through');
  });

  it('does not apply strikethrough when not completed', () => {
    render(<MissionCard {...defaultProps} completed={false} />);
    const description = screen.getByText('Read 3 stories');
    expect(description.className).not.toContain('line-through');
  });
});
