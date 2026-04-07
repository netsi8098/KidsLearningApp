import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...filterMotionProps(props)}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...filterMotionProps(props)}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...filterMotionProps(props)}>{children}</span>,
    p: ({ children, ...props }: any) => <p {...filterMotionProps(props)}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Strip framer-motion specific props to avoid React warnings
function filterMotionProps(props: Record<string, any>) {
  const {
    initial, animate, exit, transition, whileHover, whileTap, whileFocus,
    whileDrag, whileInView, layout, layoutId, variants, ...rest
  } = props;
  return rest;
}

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

import EmptyState from '../../../src/components/EmptyState';

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('EmptyState', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders emoji and title', () => {
    renderWithRouter(<EmptyState emoji="📚" title="No items yet" />);
    expect(screen.getByText('📚')).toBeInTheDocument();
    expect(screen.getByText('No items yet')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    renderWithRouter(
      <EmptyState emoji="🎮" title="Nothing here" subtitle="Start exploring to find content" />
    );
    expect(screen.getByText('Start exploring to find content')).toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () => {
    renderWithRouter(<EmptyState emoji="🎮" title="Nothing here" />);
    expect(screen.queryByText('Start exploring to find content')).not.toBeInTheDocument();
  });

  it('renders mascot emoji when provided', () => {
    renderWithRouter(<EmptyState emoji="📚" title="Empty" mascot="🦁" />);
    expect(screen.getByText('🦁')).toBeInTheDocument();
  });

  it('renders primary action button and handles click with onAction', () => {
    const onAction = vi.fn();
    renderWithRouter(
      <EmptyState emoji="📚" title="Empty" actionLabel="Go Explore" onAction={onAction} />
    );
    const button = screen.getByText('Go Explore');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('navigates on primary action button click when actionRoute is provided', () => {
    renderWithRouter(
      <EmptyState emoji="📚" title="Empty" actionLabel="Explore" actionRoute="/explore" />
    );
    fireEvent.click(screen.getByText('Explore'));
    expect(mockNavigate).toHaveBeenCalledWith('/explore');
  });

  it('does not render action button when actionLabel is missing', () => {
    renderWithRouter(<EmptyState emoji="📚" title="Empty" actionRoute="/explore" />);
    expect(screen.queryByText('Explore')).not.toBeInTheDocument();
  });

  it('renders secondary action and handles onSecondaryAction click', () => {
    const onSecondary = vi.fn();
    renderWithRouter(
      <EmptyState
        emoji="📚"
        title="Empty"
        secondaryLabel="Maybe later"
        onSecondaryAction={onSecondary}
      />
    );
    fireEvent.click(screen.getByText('Maybe later'));
    expect(onSecondary).toHaveBeenCalledTimes(1);
  });

  it('navigates when secondaryRoute is provided', () => {
    renderWithRouter(
      <EmptyState emoji="📚" title="Empty" secondaryLabel="Go back" secondaryRoute="/home" />
    );
    fireEvent.click(screen.getByText('Go back'));
    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });

  it('hides content when visible is false', () => {
    renderWithRouter(<EmptyState emoji="📚" title="Hidden State" visible={false} />);
    expect(screen.queryByText('Hidden State')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = renderWithRouter(
      <EmptyState emoji="📚" title="Styled" className="my-custom-class" />
    );
    expect(container.querySelector('.my-custom-class')).toBeInTheDocument();
  });
});
