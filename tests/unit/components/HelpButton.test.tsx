import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
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

import HelpButton from '../../../src/components/HelpButton';

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('HelpButton', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('renders with "?" text', () => {
    renderWithRouter(<HelpButton />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('has aria-label "Help"', () => {
    renderWithRouter(<HelpButton />);
    expect(screen.getByLabelText('Help')).toBeInTheDocument();
  });

  it('navigates to /help when clicked without articleSlug', () => {
    renderWithRouter(<HelpButton />);
    fireEvent.click(screen.getByLabelText('Help'));
    expect(mockNavigate).toHaveBeenCalledWith('/help');
  });

  it('navigates to /help with article query param when articleSlug is provided', () => {
    renderWithRouter(<HelpButton articleSlug="getting-started" />);
    fireEvent.click(screen.getByLabelText('Help'));
    expect(mockNavigate).toHaveBeenCalledWith('/help?article=getting-started');
  });

  it('applies custom className', () => {
    renderWithRouter(<HelpButton className="extra-class" />);
    const button = screen.getByLabelText('Help');
    expect(button.className).toContain('extra-class');
  });

  it('renders as a button element', () => {
    renderWithRouter(<HelpButton />);
    expect(screen.getByRole('button', { name: 'Help' })).toBeInTheDocument();
  });

  it('navigates to correct article for different slugs', () => {
    renderWithRouter(<HelpButton articleSlug="parental-controls" />);
    fireEvent.click(screen.getByLabelText('Help'));
    expect(mockNavigate).toHaveBeenCalledWith('/help?article=parental-controls');
  });
});
