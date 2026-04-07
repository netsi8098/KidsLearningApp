import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

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

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

import UpgradePrompt from '../../../src/components/UpgradePrompt';

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('UpgradePrompt', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders full layout by default', () => {
    renderWithRouter(<UpgradePrompt />);
    expect(screen.getByText('Unlock Premium')).toBeInTheDocument();
    expect(screen.getByText('Upgrade Now')).toBeInTheDocument();
  });

  it('shows premium feature list in full layout', () => {
    renderWithRouter(<UpgradePrompt />);
    expect(screen.getByText('All 316+ activities')).toBeInTheDocument();
    expect(screen.getByText('Offline learning packs')).toBeInTheDocument();
    expect(screen.getByText('Up to 5 profiles')).toBeInTheDocument();
    expect(screen.getByText('No advertisements')).toBeInTheDocument();
    expect(screen.getByText('Advanced reports')).toBeInTheDocument();
    expect(screen.getByText('Custom routines')).toBeInTheDocument();
  });

  it('shows pricing info in full layout', () => {
    renderWithRouter(<UpgradePrompt />);
    expect(screen.getByText('14-day free trial, then $4.99/month')).toBeInTheDocument();
  });

  it('navigates to /billing when "Upgrade Now" is clicked', () => {
    renderWithRouter(<UpgradePrompt />);
    fireEvent.click(screen.getByText('Upgrade Now'));
    expect(mockNavigate).toHaveBeenCalledWith('/billing');
  });

  it('renders compact layout when compact=true', () => {
    renderWithRouter(<UpgradePrompt compact={true} />);
    expect(screen.getByText('Upgrade')).toBeInTheDocument();
    expect(screen.getByText('This content is part of Premium')).toBeInTheDocument();
    // Should NOT show full feature list
    expect(screen.queryByText('All 316+ activities')).not.toBeInTheDocument();
  });

  it('shows feature-specific description in compact mode', () => {
    renderWithRouter(<UpgradePrompt compact={true} feature="offline_packs" />);
    expect(screen.getByText('Download lessons for offline learning')).toBeInTheDocument();
  });

  it('shows generic text in compact mode when feature is unknown', () => {
    renderWithRouter(<UpgradePrompt compact={true} feature="unknown_feature" />);
    expect(screen.getByText('Unlock this feature')).toBeInTheDocument();
  });

  it('shows feature description in full layout when valid feature is provided', () => {
    renderWithRouter(<UpgradePrompt feature="all_content" />);
    expect(screen.getByText('Access 316+ learning activities')).toBeInTheDocument();
  });

  it('navigates to /billing when compact "Upgrade" button is clicked', () => {
    renderWithRouter(<UpgradePrompt compact={true} />);
    fireEvent.click(screen.getByText('Upgrade'));
    expect(mockNavigate).toHaveBeenCalledWith('/billing');
  });

  it('shows lock emoji', () => {
    renderWithRouter(<UpgradePrompt />);
    const locks = screen.getAllByText('🔒');
    expect(locks.length).toBeGreaterThanOrEqual(1);
  });
});
