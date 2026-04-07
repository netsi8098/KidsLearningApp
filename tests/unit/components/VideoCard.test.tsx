import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { VideoItem } from '../../../src/data/videoConfig';

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

import VideoCard from '../../../src/components/VideoCard';

const mockVideo: VideoItem = {
  id: 'abc123',
  title: 'Learn the Alphabet',
  channel: 'Kids TV',
  thumbnail: 'https://img.youtube.com/vi/abc123/mqdefault.jpg',
  duration: '5:30',
  category: 'alphabet',
};

describe('VideoCard', () => {
  const defaultProps = {
    video: mockVideo,
    isFavorite: false,
    onPlay: vi.fn(),
    onToggleFavorite: vi.fn(),
  };

  beforeEach(() => {
    defaultProps.onPlay.mockClear();
    defaultProps.onToggleFavorite.mockClear();
  });

  it('renders video title and channel', () => {
    render(<VideoCard {...defaultProps} />);
    expect(screen.getByText('Learn the Alphabet')).toBeInTheDocument();
    expect(screen.getByText('Kids TV')).toBeInTheDocument();
  });

  it('renders thumbnail image with alt text', () => {
    render(<VideoCard {...defaultProps} />);
    const img = screen.getByAltText('Learn the Alphabet') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toBe('https://img.youtube.com/vi/abc123/mqdefault.jpg');
  });

  it('renders duration badge when video has duration', () => {
    render(<VideoCard {...defaultProps} />);
    expect(screen.getByText('5:30')).toBeInTheDocument();
  });

  it('calls onPlay with the video when card is clicked', () => {
    render(<VideoCard {...defaultProps} />);
    // Click on the outer div (the card)
    fireEvent.click(screen.getByText('Learn the Alphabet').closest('[class*="rounded"]')!);
    expect(defaultProps.onPlay).toHaveBeenCalledWith(mockVideo);
  });

  it('shows favorite heart emoji when isFavorite is true', () => {
    render(<VideoCard {...defaultProps} isFavorite={true} />);
    expect(screen.getByText('❤️')).toBeInTheDocument();
  });

  it('shows unfavorite heart emoji when isFavorite is false', () => {
    render(<VideoCard {...defaultProps} isFavorite={false} />);
    expect(screen.getByText('🤍')).toBeInTheDocument();
  });

  it('calls onToggleFavorite when favorite button is clicked', () => {
    render(<VideoCard {...defaultProps} />);
    const favButton = screen.getByText('🤍').closest('button')!;
    fireEvent.click(favButton);
    expect(defaultProps.onToggleFavorite).toHaveBeenCalledWith('abc123');
    // Should not trigger onPlay when toggling favorite
    expect(defaultProps.onPlay).not.toHaveBeenCalled();
  });

  it('shows watched overlay when isWatched is true', () => {
    render(<VideoCard {...defaultProps} isWatched={true} />);
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('shows NEW badge when isNew is true and not watched', () => {
    render(<VideoCard {...defaultProps} isNew={true} isWatched={false} />);
    expect(screen.getByText('NEW')).toBeInTheDocument();
  });

  it('does not show NEW badge when isNew is true but isWatched is also true', () => {
    render(<VideoCard {...defaultProps} isNew={true} isWatched={true} />);
    expect(screen.queryByText('NEW')).not.toBeInTheDocument();
  });

  it('renders progress bar when watchProgress is between 0 and 100', () => {
    const { container } = render(<VideoCard {...defaultProps} watchProgress={50} />);
    const progressBar = container.querySelector('[style*="width: 50%"]');
    expect(progressBar).toBeInTheDocument();
  });

  it('does not render progress bar when watchProgress is 0', () => {
    const { container } = render(<VideoCard {...defaultProps} watchProgress={0} />);
    // watchProgress > 0 check means 0 should not show the bar
    const progressBarContainer = container.querySelector('.h-\\[3px\\]');
    expect(progressBarContainer).not.toBeInTheDocument();
  });
});
